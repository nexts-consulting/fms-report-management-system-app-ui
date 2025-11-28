"use client";

import { Button } from "@/kits/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";
import { Modal } from "@/kits/components/Modal";
import { useNotification } from "@/kits/components/Notification";
import { SelectModal } from "@/kits/components/SelectModal";
import { StyleUtil } from "@/kits/utils";
import { OutletMap } from "@/kits/widgets/OutletMap";
import { useQueryOutletByProvinceList } from "@/services/api/outlet/list-by-province";
import { useQueryProvinceList } from "@/services/api/province/list";
import { IOutlet, IProvince, EUserAccountRole } from "@/types/model";
import { useRouter } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { ScreenFooter } from "@/components/ScreenFooter";
import { useAuthContext } from "@/contexts/auth.context";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();
  const notification = useNotification();

  const [confirmLoading, setConfirmLoading] = React.useState(false);

  const [selectedProvince, setSelectedProvince] = React.useState<{
    label: string;
    value: IProvince;
  } | null>(null);

  const [selectedOutlet, setSelectedOutlet] = React.useState<IOutlet | null>(null);

  const provinceListQuery = useQueryProvinceList({
    params: {},
    config: {
      onError: (error) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách tỉnh/thành phố",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  const outletListQuery = useQueryOutletByProvinceList({
    params: {
      provinceId: selectedProvince?.value.id ?? 0,
    },
    config: {
      enabled: !!selectedProvince?.value.id,
      onError: (error) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách outlet",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  const provinceOptions = React.useMemo(() => {
    return (
      provinceListQuery.data?.data.map((province) => ({
        label: province.name,
        value: province,
      })) ?? []
    );
  }, [provinceListQuery.data]);

  const isDisplayOutletList = React.useMemo(() => {
    return (
      selectedProvince &&
      !outletListQuery.isLoading &&
      !outletListQuery.isFetching &&
      (outletListQuery.data?.data.length ?? 0) > 0
    );
  }, [
    selectedProvince,
    outletListQuery.isLoading,
    outletListQuery.isFetching,
    outletListQuery.data,
  ]);

  const handleConfirm = () => {
    globalStore.setState({
      selectedProvince: selectedProvince?.value,
      selectedOutlet: selectedOutlet,
    });

    setConfirmLoading(true);

    setTimeout(() => {
      router.push("/lobby");
      setConfirmLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setSelectedOutlet(null);
  };

  React.useEffect(() => {
    if (currentAttendance) {
      router.push("/attendance/tracking");
    }
  }, [currentAttendance]);

  React.useEffect(() => {
    if (user && user?.account?.role === EUserAccountRole.SALE) {
      router.replace("/sale/lobby");
    }
  }, [user]);

  return (
    <>
      <LoadingOverlay active={confirmLoading} />

      <ScreenHeader
        title="Địa điểm làm việc"
        loading={outletListQuery.isLoading || outletListQuery.isFetching}
        onBack={() => router.back()}
      />

      <div className="px-4">
        <NotificationBanner
          type="info"
          title="Tips"
          description="Bạn có thể thay đổi địa điểm làm việc bất cứ lúc nào!"
        />

        {/* Tile */}
        <div className="mt-4 w-full bg-white px-4 py-12">
          <SelectModal
            label="Tỉnh/Thành phố"
            placeholder="Chọn tỉnh/thành phố"
            searchPlaceholder="Tìm kiếm tỉnh/thành phố"
            options={provinceOptions}
            error={provinceListQuery.isError}
            loading={provinceListQuery.isLoading || provinceListQuery.isFetching}
            selectedOption={selectedProvince}
            onSelect={(option) => setSelectedProvince(option)}
            messages={{
              noOptions: "Danh sách tỉnh/thành phố trống",
              noOptionsFound: "Không tìm thấy tỉnh/thành phố",
            }}
          />
        </div>

        {/* Tile */}
        {isDisplayOutletList && (
          <div className="mt-4 w-full bg-white px-4 py-12">
            <div>
              {outletListQuery.data?.data.map((outlet) => (
                <OutletCard
                  key={outlet.id}
                  outlet={outlet}
                  onClick={() => setSelectedOutlet(outlet)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedOutlet}
        onClose={() => setSelectedOutlet(null)}
        title='XÁC NHẬN ĐỊA ĐIỂM'
      // description={selectedOutlet?.address}
      >
        {selectedOutlet && (
          <div className="bg-gray-10 p-4">
            <div className="flex flex-col gap-4">
              <header className="flex items-center gap-2">
                <p className="text-sm font-medium">Tên địa điểm: </p>
                <p className="text-sm text-gray-70">{selectedOutlet.name}</p>
              </header>
              <p className="text-sm text-gray-70">
                Địa chỉ: {selectedOutlet.address}
              </p>
            </div>
            {/* <div className="aspect-square h-auto w-full bg-white p-4">
              <OutletMap
                gps={{
                  lat: selectedOutlet.latitude,
                  lng: selectedOutlet.longitude,
                }}
                radius={selectedOutlet.checkinRadiusMeters}
              />
            </div> */}
          </div>
        )}

        <div className="grid grid-cols-2">
          <Button
            variant="secondary"
            size="large"
            className="w-full"
            icon={Icons.Close}
            onClick={handleCancel}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            size="large"
            className="w-full"
            icon={Icons.ArrowRight}
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>

      <ScreenFooter />
    </>
  );
};

interface OutletCardProps {
  outlet: IOutlet;
  onClick: () => void;
}

const OutletCard = (props: OutletCardProps) => {
  const { outlet, onClick } = props;

  const [isOpenMapModal, setIsOpenMapModal] = React.useState(false);

  const handleMapClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpenMapModal(true);
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <>
      <button
        type="button"
        className={StyleUtil.cn(
          "block w-full bg-white p-4 text-left hover:bg-gray-10",
          "outline outline-1 -outline-offset-1 outline-gray-30",
          "focus:bg-gray-10 focus:outline-primary-60",
        )}
        onClick={handleClick}
      >
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-sm font-medium">{outlet.name}</p>
            <p className="line-clamp-1 text-sm text-gray-30">[{outlet.code}]</p>
          </div>
          <p className="text-sm text-gray-70">{outlet.address}</p>
        </div>
        <IconButton
          icon={Icons.Map}
          size="large"
          tooltip="Xem trên bản đồ"
          tooltipPlacement="right"
          onClick={handleMapClick}
        />

        <div className="mt-4 flex items-center justify-end">
          <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
        </div>
      </button>

      <Modal
        isOpen={isOpenMapModal}
        onClose={() => setIsOpenMapModal(false)}
        title={outlet.name}
        description={outlet.address}
      >
        <div className="aspect-square h-auto w-full p-4">
          <OutletMap
            gps={{ lat: outlet.latitude, lng: outlet.longitude }}
            radius={outlet.checkinRadiusMeters}
          />
        </div>
      </Modal>
    </>
  );
};
