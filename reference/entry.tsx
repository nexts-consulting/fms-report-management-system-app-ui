"use client";

import { useQueryCustomerList } from "@/services/api/customer/list";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/kits/components/Button";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useRouter } from "next/navigation";
import { Icons } from "@/kits/components/Icons";
import { TextInput } from "@/kits/components/TextInput";
import { ICustomer } from "@/services/api/customer/list";
import { AppConfig } from "@/config";
import { useGlobalContext } from "@/contexts/global.context";

const INITIAL_PAGE_SIZE = 10;
const PAGE_SIZE_INCREMENT = 10;

const giftConfig = [
  { id: "scheme_1", name: "Dây đeo thẻ + Bộ truyện Akooland" },
  { id: "scheme_2", name: "Ống cắm bút Demon Slayer + Bộ truyện Akooland" },
  { id: "scheme_3", name: "Máy hút bụi mini + Bộ truyện Akooland" },
  { id: "bonus_photo", name: "Chụp hình lưu lại khoảnh khắc" },
  { id: "bonus_christmas_card", name: "Thiệp giáng sinh" },
  { id: "event_checkin_bag", name: "Quà tặng check in_Túi mù",},
  { id: "event_kol_blm", name: "Quà tặng tác phẩm KOL chọn_BLM Bấm 013 - 015 - 6 màu",},
  { id: "event_register_pen", name: "Quà tặng đăng ký_Fiber pen 5 màu FP-C021 - 22",},
  { id: "event_register_tote", name: "Quà tặng đăng ký_Túi Tote",},
];

const checkStatusColors: Record<string, string> = {
  CHECKING: "warning",
  VERIFIED: "success",
};
const checkStatusLabels: Record<string, string> = {
  CHECKING: "Đang được xử lý",
  VERIFIED: "Đã kiểm tra",
};

const verificationStatusColors: Record<string, string> = {
  CORRECT: "success",
  INCORRECT: "error",
};
const verificationStatusLabels: Record<string, string> = {
  CORRECT: "Data hợp lệ",
  INCORRECT: "Data không hợp lệ",
};

const StatusChip = ({ status, type }: { status: string; type: string }) => {
  const colors = {
    success: 'text-green-600 bg-green-10',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-20',
    default: 'text-gray-600 bg-gray-100'
  };

  return (
    <span className={`px-2 py-0.5 text-xs ${colors[type as keyof typeof colors]}`}>
      {status}
    </span>
  );
};

export const Entry = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const { ref, inView } = useInView();
  const router = useRouter();
  const globalStore = useGlobalContext();
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const currentAttendance = globalStore.use.currentAttendance();

  const dateString = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  const { data, isLoading, isFetching } = useQueryCustomerList({
    params: {
      staffAttendanceId: currentAttendance?.id,
      date: dateString,
      page: 0,
      size: pageSize,
    },
  });

  useEffect(() => {
    if (inView && !isLoading && !isFetching && data?.data?.content) {
      const totalElements = data.data.totalElements;
      if (pageSize < totalElements) {
        setPageSize(prev => Math.min(prev + PAGE_SIZE_INCREMENT, totalElements));
      }
    }
  }, [inView, isLoading, isFetching, data]);

  const customers = useMemo(() => {
    if (!data?.data?.content) return [];
    return data.data.content;
  }, [data]);

  const fetchCustomerList = () => {
    setPageSize(INITIAL_PAGE_SIZE);
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [dateString]);

  return (
    <>
      <ScreenHeader
        title="Dữ liệu khách hàng"
        onBack={() => router.back()}
      />
      <div className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <TextInput
            type="date"
            value={dateString}
            onChange={handleDateChange}
            className="w-full border border-gray-200"
          />
          <Button
            variant="primary"
            onClick={() => fetchCustomerList()}
          >
            Làm mới dữ liệu
          </Button>
        </div>

     
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="border border-gray-200 p-4 shadow-sm bg-white cursor-pointer"
            onClick={() => setSelectedCustomer(customer)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{customer.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{customer.phoneNumber}</p>
                <p className="text-xs text-gray-600 mb-2">
                  Tổng hóa đơn: {customer.totalInvoice != null ? customer.totalInvoice.toLocaleString("vi-VN") + " VNĐ" : "–"}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Trạng thái xử lý: <StatusChip 
                  status={checkStatusLabels[customer.checkStatus as keyof typeof checkStatusLabels]} 
                  type={checkStatusColors[customer.checkStatus as keyof typeof checkStatusColors]} />
                </p >
                <p className="text-xs text-gray-600 mb-2">Kết quả xác thực:<StatusChip 
                status={verificationStatusLabels[customer.verificationResult as keyof typeof verificationStatusLabels]} 
                type={verificationStatusColors[customer.verificationResult as keyof typeof verificationStatusColors] || "info"} /></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
            </div>


            <div className="mt-3 flex justify-end">
              <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}

        {(isLoading || isFetching) && <LoadingOverlay />}

        <div ref={ref} className="h-10" />
      </div>

      {/* Modal chi tiết khách hàng */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold">Chi tiết khách hàng</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="p-4 space-y-4">
                {/* Thông tin khách hàng */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tên khách hàng:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Số điện thoại:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCustomer.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng hóa đơn:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCustomer.totalInvoice != null ? selectedCustomer.totalInvoice.toLocaleString("vi-VN") + " VNĐ" : "–"}</span>
                    </div>
                    
                  </div>
                </div>
                {/* Thông tin mua hàng */}
                {selectedCustomer.saleReport != null && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Thông tin quà tặng
                    </h4>
                    <div className="flex flex-col gap-6">
                      <div key={selectedCustomer.saleReport.id} className="space-y-4 border border-gray-200">
                      {/* Quà tặng đã nhận */}
                      <div>
                        <div>
                          <table className="min-w-full border rounded divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tên quà tặng</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Số lượng</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(selectedCustomer.saleReport.gifts)
                                .filter(([_, quantity]) => (quantity as number) > 0)
                                .map(([giftId, quantity]) => (
                                  <tr key={giftId}>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {giftConfig.find((gift) => gift.id === giftId)?.name || giftId}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                      {quantity as number}
                                    </td>
                                  </tr>
                                ))}
                              {Object.entries(selectedCustomer.saleReport.gifts).filter(([_, quantity]) => (quantity as number) > 0).length === 0 && (
                                <tr>
                                  <td className="px-4 py-2 text-center text-sm text-gray-500" colSpan={2}>
                                    Không có quà tặng nào
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {/* Hóa đơn */}
                      {selectedCustomer.saleReport?.invoiceImages?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            Hình ảnh hóa đơn
                          </h4>
                          <div className="bg-white border p-2 ">
                            {selectedCustomer.saleReport?.invoiceImages?.map((invoiceImage: string) => (
                              <div key={invoiceImage} className="mb-2">
                              <img
                                src={invoiceImage}
                                alt="Hóa đơn"
                                  className="w-full h-auto"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hình khách hàng nhận quà */}
                      {selectedCustomer.saleReport?.giftReceiveImage && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            Hình khách hàng nhận quà
                          </h4>
                          <div className="bg-white border p-2 ">
                            <img
                              src={selectedCustomer.saleReport.giftReceiveImage}
                              alt="Hình khách hàng nhận quà"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Lịch sử xử lý</h4>
                  <div className="space-y-4 border border-gray-200  p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ngày xử lý:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer.checkedAt
                          ? format(new Date(selectedCustomer.checkedAt), "dd/MM/yyyy")
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trạng thái xử lý:</span>
                      <span className="text-sm font-medium text-gray-900">
                        <StatusChip
                          status={checkStatusLabels[selectedCustomer.checkStatus as keyof typeof checkStatusLabels]}
                          type={checkStatusColors[selectedCustomer.checkStatus as keyof typeof checkStatusColors] || "info"}
                        />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kết quả xác thực:</span>
                      <span className="text-sm font-medium text-gray-900">
                        <StatusChip 
                        status={verificationStatusLabels[selectedCustomer.verificationResult as keyof typeof verificationStatusLabels]} 
                        type={verificationStatusColors[selectedCustomer.verificationResult as keyof typeof verificationStatusColors] || "info"} /></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ghi chú:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCustomer.checkNote}</span>
                    </div>
                  </div>
                  </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <Button
                variant="tertiary"
                onClick={() => setSelectedCustomer(null)}
                className="w-full"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};