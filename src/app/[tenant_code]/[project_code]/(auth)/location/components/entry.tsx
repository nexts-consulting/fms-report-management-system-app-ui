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
import { IAdminDivision, IAdminDivisionWithChildren } from "@/types/model";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { ScreenFooter } from "@/components/ScreenFooter";
import { useAuthContext } from "@/contexts/auth.context";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { ILocation } from "@/types/model";
import { useQueryLocationByAdminDivision } from "@/services/api/application/location/list-by-admin-division";
import { useQueryAdminDivisionList } from "@/services/api/application/admin-division/list";
import { buildAdminDivisionTree, getAllChildDivisionIds } from "@/services/api/application/admin-division/list";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const params = useParams();
  const projectCode = params?.project_code as string;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();
  const notification = useNotification();
  const { buildPath } = useTenantProjectPath();

  const [confirmLoading, setConfirmLoading] = React.useState(false);

  // State for dynamic cascade dropdowns - array stores selected division for each level
  // selectedLevels[0] = level 1, selectedLevels[1] = level 2, ...
  const [selectedLevels, setSelectedLevels] = React.useState<({
    label: string;
    value: IAdminDivision;
  } | null)[]>([]);

  const [selectedLocation, setSelectedLocation] = React.useState<ILocation | null>(null);

  const adminDivisionListQuery = useQueryAdminDivisionList({
    params: {
      project_code: projectCode || "",
    },
    config: {
      enabled: !!projectCode,
      onError: (error: any) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách khu vực",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  // Build tree structure from admin divisions
  const adminDivisionTree = React.useMemo(() => {
    if (!adminDivisionListQuery.data?.data) return [];
    return buildAdminDivisionTree(adminDivisionListQuery.data.data);
  }, [adminDivisionListQuery.data]);

  // Calculate max level from divisions
  const maxLevel = React.useMemo(() => {
    if (!adminDivisionListQuery.data?.data || adminDivisionListQuery.data.data.length === 0) return 0;
    return Math.max(...adminDivisionListQuery.data.data.map((d: IAdminDivisionWithChildren) => d.level));
  }, [adminDivisionListQuery.data]);

  // Sync selectedLevels with maxLevel
  React.useEffect(() => {
    if (maxLevel > 0) {
      setSelectedLevels((prev) => {
        const newLevels = [...prev];
        // Ensure array has enough elements for maxLevel
        while (newLevels.length < maxLevel) {
          newLevels.push(null);
        }
        // Trim if maxLevel decreased (but keep selected values)
        if (newLevels.length > maxLevel) {
          return newLevels.slice(0, maxLevel);
        }
        return newLevels;
      });
    } else {
      setSelectedLevels([]);
    }
  }, [maxLevel]);

  // Helper function to find division in tree by ID
  const findDivisionInTree = React.useCallback(
    (tree: IAdminDivisionWithChildren[], id: number): IAdminDivisionWithChildren | null => {
      for (const division of tree) {
        if (division.id === id) return division;
        if (division.children) {
          const found = findDivisionInTree(division.children, id);
          if (found) return found;
        }
      }
      return null;
    },
    [],
  );

  // Get options for a specific level
  const getLevelOptions = React.useCallback(
    (level: number, parentId: number | null): Array<{ key: string; label: string; value: IAdminDivision }> => {
      if (level === 1) {
        // Level 1: root divisions
        return adminDivisionTree.map((division: IAdminDivisionWithChildren, index: number) => ({
          key: `level-${level}-division-${division.id}-${index}`,
          label: division.name,
          value: division,
        }));
      } else {
        // Level > 1: children of selected parent at previous level
        if (!parentId) return [];
        const parent = findDivisionInTree(adminDivisionTree, parentId);
        if (!parent || !parent.children || parent.children.length === 0) return [];
        return parent.children.map((division, index) => ({
          key: `level-${level}-division-${division.id}-${index}`,
          label: division.name,
          value: division,
        }));
      }
    },
    [adminDivisionTree, findDivisionInTree],
  );

  // Get final selected division (the last non-null selection)
  const finalSelectedDivision = React.useMemo(() => {
    for (let i = selectedLevels.length - 1; i >= 0; i--) {
      if (selectedLevels[i]) {
        return selectedLevels[i];
      }
    }
    return null;
  }, [selectedLevels]);

  // Get all division IDs (final selected + all children) for location query
  const allDivisionIds = React.useMemo(() => {
    if (!finalSelectedDivision || !adminDivisionListQuery.data?.data) return [];
    return getAllChildDivisionIds(adminDivisionListQuery.data.data, finalSelectedDivision.value.id);
  }, [finalSelectedDivision, adminDivisionListQuery.data]);

  // Handler for level change
  const handleLevelChange = React.useCallback(
    (level: number, option: { label: string; value: IAdminDivision } | null) => {
      setSelectedLevels((prev) => {
        const newLevels = [...prev];
        // Ensure array has enough elements
        while (newLevels.length < maxLevel) {
          newLevels.push(null);
        }
        // Set value for current level
        newLevels[level - 1] = option;
        // Reset all levels after current level
        for (let i = level; i < maxLevel; i++) {
          newLevels[i] = null;
        }
        // Reset location when division changes
        setSelectedLocation(null);
        return newLevels;
      });
    },
    [maxLevel],
  );

  const locationListQuery = useQueryLocationByAdminDivision({
    params: {
      project_code: projectCode || "",
      admin_division_ids: allDivisionIds.length > 0 ? allDivisionIds : undefined,
    },
    config: {
      enabled: !!projectCode && !!finalSelectedDivision && allDivisionIds.length > 0,
      onError: (error: any) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách địa điểm",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  const isDisplayLocationList = React.useMemo(() => {
    return (
      finalSelectedDivision &&
      !locationListQuery.isLoading &&
      !locationListQuery.isFetching &&
      (locationListQuery.data?.data.length ?? 0) > 0
    );
  }, [
    finalSelectedDivision,
    locationListQuery.isLoading,
    locationListQuery.isFetching,
    locationListQuery.data,
  ]);

  const handleConfirm = () => {
    if (selectedLocation && finalSelectedDivision) {
      globalStore.setState({
        selectedAdminDivision: finalSelectedDivision.value,
        selectedLocation: selectedLocation,
      });
    }

    setConfirmLoading(true);

    setTimeout(() => {
      router.push(buildPath("/lobby"));
      setConfirmLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setSelectedLocation(null);
  };

  React.useEffect(() => {
    if (currentAttendance) {
      router.push(buildPath("/attendance/tracking"));
    }
  }, [currentAttendance]);

  return (
    <>
      <LoadingOverlay active={confirmLoading} />

      <ScreenHeader
        title="Địa điểm làm việc"
        loading={locationListQuery.isLoading || locationListQuery.isFetching}
        onBack={() => router.back()}
      />

      <div className="px-4">
        <NotificationBanner
          type="info"
          title="Tips"
          description="Bạn có thể thay đổi địa điểm làm việc bất cứ lúc nào!"
        />

        {/* Tile - Dynamic Division Dropdowns */}
        <div className="mt-4 w-full bg-white px-4 py-12 space-y-4">
          {maxLevel > 0 &&
            Array.from({ length: maxLevel }, (_, index) => {
              const level = index + 1;
              const parentId = level === 1 ? null : selectedLevels[level - 2]?.value.id ?? null;
              const options = getLevelOptions(level, parentId);
              const shouldShow =
                level === 1
                  ? options.length > 0
                  : selectedLevels[level - 2] != null && options.length > 0;

              if (!shouldShow) return null;

              return (
                <SelectModal
                  key={`division-level-${level}`}
                  label={level === 1 ? "Khu vực" : ""}
                  placeholder={level === 1 ? "Chọn khu vực" : `Chọn khu vực Level ${level} (tùy chọn)`}
                  searchPlaceholder="Tìm kiếm khu vực"
                  options={options}
                  error={level === 1 ? adminDivisionListQuery.isError : false}
                  loading={level === 1 ? adminDivisionListQuery.isLoading || adminDivisionListQuery.isFetching : false}
                  selectedOption={selectedLevels[level - 1] ?? null}
                  onSelect={(option) => handleLevelChange(level, option)}
                  messages={{
                    noOptions: "Danh sách khu vực trống",
                    noOptionsFound: "Không tìm thấy khu vực",
                  }}
                />
              );
            })}
        </div>

        {/* Tile */}
        {isDisplayLocationList && (
          <div className="mt-4 w-full bg-white px-4 py-12">
            <div>
              {locationListQuery.data?.data.map((location: ILocation, index: number) => (
                <LocationCard
                  key={`location-${location.id}-${index}`}
                  location={location}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        title='Xác nhận địa điểm'
      >
        {selectedLocation && (
          <div className="bg-gray-10 p-4">
            <div className="flex flex-col mb-4" >
              <header className="flex items-center gap-2">
                <p className="text-sm font-medium">Tên địa điểm: </p>
                <p className="text-sm text-gray-70">{selectedLocation.name}</p>
              </header>
              <p className="text-sm text-gray-70">
                Địa chỉ: {selectedLocation.address || "Không có địa chỉ"}
              </p>
            </div>
            {/* {selectedLocation.latitude && selectedLocation.longitude && (
              <div className="aspect-square h-auto w-full bg-white p-4">
                <OutletMap
                  gps={{
                    lat: selectedLocation.latitude,
                    lng: selectedLocation.longitude,
                  }}
                  radius={selectedLocation.checkin_radius_meters}
                />
              </div>
            )} */}
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

interface LocationCardProps {
  location: ILocation;
  onClick: () => void;
}

const LocationCard = (props: LocationCardProps) => {
  const { location, onClick } = props;

  const [isOpenMapModal, setIsOpenMapModal] = React.useState(false);

  const handleMapClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpenMapModal(true);
  };

  const handleClick = () => {
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={StyleUtil.cn(
          "block w-full bg-white p-4 text-left hover:bg-gray-10 cursor-pointer",
          "outline outline-1 -outline-offset-1 outline-gray-30",
          "focus:bg-gray-10 focus:outline-primary-60",
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-sm font-medium">{location.name}</p>
            <p className="line-clamp-1 text-sm text-gray-30">[{location.code}]</p>
          </div>
          <p className="text-sm text-gray-70">{location.address || "Không có địa chỉ"}</p>
        </div>
        {location.latitude && location.longitude && (
          <IconButton
            icon={Icons.Map}
            size="large"
            tooltip="Xem trên bản đồ"
            tooltipPlacement="right"
            onClick={handleMapClick}
          />
        )}

        <div className="mt-4 flex items-center justify-end">
          <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
        </div>
      </div>

      {location.latitude && location.longitude && (
        <Modal
          isOpen={isOpenMapModal}
          onClose={() => setIsOpenMapModal(false)}
          title={location.name}
          description={location.address || undefined}
        >
          <div className="aspect-square h-auto w-full p-4">
            <OutletMap
              gps={{ lat: location.latitude, lng: location.longitude }}
              radius={location.checkin_radius_meters}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
