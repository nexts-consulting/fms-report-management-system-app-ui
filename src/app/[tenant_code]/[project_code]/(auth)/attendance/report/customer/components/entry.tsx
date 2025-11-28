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
import { ISaleReport } from "@/types/model";
import { AppConfig } from "@/config";

const INITIAL_PAGE_SIZE = 10;
const PAGE_SIZE_INCREMENT = 10;

const productConfig = {
  SCU_PROBI_VIET_QUAT_65ML: { size: 65, name: "SCU Probi Việt Quất 65ml" },
  SCU_PROBI_DAU_65ML: { size: 65, name: "SCU Probi Dâu 65ml" },
  SCU_PROBI_TRUYEN_THONG_65ML: { size: 65, name: "SCU Probi Truyền Thống 65ml" },
  SCU_PROBI_DUA_65ML: { size: 65, name: "SCU Probi Dứa 65ml" },
  SCU_PROBI_DUA_GANG_65ML: { size: 65, name: "SCU Probi Dưa Gang 65ml" },
  SCU_PROBI_VIET_QUAT_130ML: { size: 130, name: "SCU Probi Việt Quất 130ml" },
  SCU_PROBI_DAU_130ML: { size: 130, name: "SCU Probi Dâu 130ml" },
  SCU_PROBI_TRUYEN_THONG_130ML: { size: 130, name: "SCU Probi Truyền Thống 130ml" },
  SCU_PROBI_DUA_130ML: { size: 130, name: "SCU Probi Dứa 130ml" },
  SCU_PROBI_DUA_GANG_130ML: { size: 130, name: "SCU Probi Dưa Gang 130ml" },
};

// Scheme quà tặng
const giftSchemes = {
  GIFT_SALE_VNM_PROBI_BOTTLE_65: { name: "02 Chai SCU Probi 65ml" },
  GIFT_SALE_VNM_PROBI_BOTTLE_130: { name: "02 Chai SCU Probi 130ml" },
  GIFT_SALE_WAIST_BAG: { name: "Túi bao tử Vinamilk" },
};

const StatusChip = ({ status, type }: { status: string; type: 'success' | 'warning' | 'error' }) => {
  const colors = {
    success: 'text-green-600 bg-green-10',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-20'
  };

  return (
    <span className={`px-2 py-0.5 text-xs ${colors[type]}`}>
      {status}
    </span>
  );
};

export const Entry = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const { ref, inView } = useInView();
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);

  const dateString = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  const { data, isLoading, isFetching } = useQueryCustomerList({
    params: {
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

  const formatProducts = (products: Record<string, number>) => {
    const productList = Object.entries(products)
      .filter(([_, quantity]) => quantity > 0)
      .map(([sku, quantity]) => ({
        name: productConfig[sku as keyof typeof productConfig]?.name || sku,
        quantity
      }));
    
    if (productList.length === 0) return "Không có sản phẩm";
    if (productList.length <= 2) {
      return productList.map(p => `${p.name}: ${p.quantity}`).join(", ");
    }
    return `${productList.slice(0, 2).map(p => `${p.name}: ${p.quantity}`).join(", ")} và ${productList.length - 2} sản phẩm khác`;
  };


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
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{customer.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{customer.phoneNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>Khảo sát:</span>
                <StatusChip 
                  status={customer.surveyReport ? "Đã hoàn thành" : "Chưa khảo sát"}
                  type={customer.surveyReport ? "success" : "error"}
                />
              </div>

              <div className="flex justify-between">
                <span>Thời gian khảo sát:</span>
                <span>{customer?.surveyCreatedAt ? format(new Date(customer?.surveyCreatedAt), "HH:mm dd/MM/yyyy") : ""}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Quà tặng khảo sát:</span>
                <StatusChip 
                  status={customer?.receivedGift || "Chưa nhận"}
                  type={customer?.receivedGift ? "success" : "warning"}
                />
              </div>

              <div className="flex justify-between">
                <span>Thời gian nhận quà:</span>
                <span>{customer?.giftReceivedAt ? format(new Date(customer?.giftReceivedAt), "HH:mm dd/MM/yyyy") : ""}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Mua hàng đổi quà:</span>
                <StatusChip 
                  status={customer?.saleReports?.length > 0 ? "Đã mua" : "Chưa mua"}
                  type={customer?.saleReports?.length > 0 ? "success" : "warning"}
                />
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
                      <span className="text-sm text-gray-600">Phương thức xác thực:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCustomer.verifiedMethod}</span>
                    </div>
                    {selectedCustomer?.otp && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mã OTP:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCustomer.otp}</span>
                      </div>
                    )}
                    {selectedCustomer?.extra?.gender && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Giới tính:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCustomer.extra.gender}</span>
                      </div>
                    )}
                    {selectedCustomer?.extra?.birthYear && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Năm sinh:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCustomer.extra.birthYear}</span>
                      </div>
                    )}
                    {selectedCustomer?.extra?.address && (
                      <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Địa chỉ:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCustomer.extra.address}</span>
                      </div>
                    )}
                    {selectedCustomer?.extra?.maritalStatus && (
                      <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tình trạng kết hôn:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedCustomer.extra.maritalStatus}</span>
                      </div>
                    )}
                    {selectedCustomer?.extra?.maritalStatus && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Số lượng con:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCustomer.extra.childrenCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Hình ảnh */}
                {selectedCustomer.image && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Hình ảnh
                    </h4>
                    <div className="bg-white border p-2">
                      <img
                        src={AppConfig.imageDomain + selectedCustomer.image}
                        alt="Hình ảnh khách hàng"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Thông tin khảo sát */}
                {selectedCustomer.surveyReport && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Thông tin khảo sát
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thời gian khảo sát:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(selectedCustomer.surveyCreatedAt), "HH:mm dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thương hiệu sử dụng:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCustomer.surveyReport.brands.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thương hiệu yêu thích:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCustomer.surveyReport.mostFrequentBrand}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hương vị sử dụng:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCustomer.surveyReport.flavorUsage.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hương vị yêu thích:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCustomer.surveyReport.mostUsedFlavor}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thông tin quà tặng */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Thông tin quà tặng
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quà tặng:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer.receivedGift || "Chưa nhận quà"}
                      </span>
                    </div>
                    {selectedCustomer.giftReceivedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thời gian nhận:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(selectedCustomer.giftReceivedAt), "HH:mm dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini games */}
                {selectedCustomer.games && selectedCustomer.games.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Trò chơi đã tham gia
                    </h4>
                    <div className="space-y-2">
                      {selectedCustomer.games.map((game, index) => (
                        <div key={index} className="text-sm text-gray-900">
                          {game}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thông tin mua hàng */}
                {selectedCustomer.saleReports && selectedCustomer.saleReports.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Thông tin mua hàng
                    </h4>
                    <div className="flex flex-col gap-6">
                      {selectedCustomer.saleReports.map((saleReport: any) => (
                        <div key={saleReport.id} className="space-y-4 border border-gray-200  p-4">
                          {/* Sản phẩm */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              Sản phẩm
                            </h4>
                            <div>
                              <table className="min-w-full border rounded divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tên sản phẩm</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Số lượng</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {Object.entries(saleReport.products)
                                    .filter(([_, quantity]) => (quantity as number) > 0)
                                    .map(([sku, quantity]) => (
                                      <tr key={sku}>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                          {productConfig[sku as keyof typeof productConfig]?.name || sku}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                          {quantity as number}
                                        </td>
                                      </tr>
                                    ))}
                                  {Object.entries(saleReport.products).filter(([_, quantity]) => (quantity as number) > 0).length === 0 && (
                                    <tr>
                                      <td className="px-4 py-2 text-center text-sm text-gray-500" colSpan={2}>
                                        Không có sản phẩm nào
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Quà tặng đã nhận */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              Quà tặng
                            </h4>
                            <div>
                              <table className="min-w-full border rounded divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tên quà tặng</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Số lượng</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {Object.entries(saleReport.gifts)
                                    .filter(([_, quantity]) => (quantity as number) > 0)
                                    .map(([giftId, quantity]) => (
                                      <tr key={giftId}>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                          {giftSchemes[giftId as keyof typeof giftSchemes]?.name || giftId}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                          {quantity as number}
                                        </td>
                                      </tr>
                                    ))}
                                  {Object.entries(saleReport.gifts).filter(([_, quantity]) => (quantity as number) > 0).length === 0 && (
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
                          {saleReport.invoiceImage && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                Hình khách mua hàng
                              </h4>
                              <div className="bg-white border p-2 rounded">
                                <img
                                  src={AppConfig.imageDomain + saleReport.invoiceImage}
                                  alt="Hình khách mua hàng"
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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