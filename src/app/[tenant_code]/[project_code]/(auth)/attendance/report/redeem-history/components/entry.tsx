"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { Button } from "@/kits/components/Button";
import { Icons } from "@/kits/components/Icons";
import { useGlobalContext } from "@/contexts/global.context";
import { redeemReportApi, GiftRedemptionSession } from "@/services/api/reports/redeem-report";
import { useNotification } from "@/kits/components/Notification";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { StyleUtil } from "@/kits/utils";
import { useRouter } from "next/navigation";
import { IconButton } from "@/kits/components/IconButton";
import { AppConfig } from "@/config";

// Cấu hình sản phẩm theo dung tích
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

export const Entry = () => {
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const notification = useNotification();
  const router = useRouter();
  const [redemptionHistory, setRedemptionHistory] = useState<GiftRedemptionSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GiftRedemptionSession | null>(null);

  // Lấy lịch sử đổi quà
  const fetchRedemptionHistory = async () => {
    if (!currentAttendance?.id) {
      notification.error({ title: "Không tìm thấy thông tin ca làm việc" });
      return;
    }

    setLoading(true);
    try {
      const response = await redeemReportApi.getRedemptionHistory(currentAttendance.id);
      if (response.status === 200) {
        setRedemptionHistory(response.data || []);
      } else {
        notification.error({ title: response.message || "Không thể tải lịch sử đổi quà" });
      }
    } catch (error) {
      console.error("Error fetching redemption history:", error);
      notification.error({ title: "Có lỗi xảy ra khi tải lịch sử đổi quà" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptionHistory();
  }, [currentAttendance?.id]);

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format số lượng sản phẩm
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

  // Format số lượng quà tặng
  const formatGifts = (gifts: Record<string, number>) => {
    const giftList = Object.entries(gifts)
      .filter(([_, quantity]) => quantity > 0)
      .map(([giftId, quantity]) => ({
        name: giftSchemes[giftId as keyof typeof giftSchemes]?.name || giftId,
        quantity
      }));
    
    if (giftList.length === 0) return "Không có quà tặng";
    return giftList.map(g => `${g.name}: ${g.quantity}`).join(", ");
  };

  // Format trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "CONFIRMED":
        return "text-green-600 bg-green-10";
      case "REJECTED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "CONFIRMED":
        return "Hoàn thành";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

return (
  <>
      <LoadingOverlay active={loading} />
      
      <ScreenHeader 
        title="Lịch sử khách hàng" 
        onBack={() => router.back()}
        loading={loading}
      />
      
      <div className="mb-4 space-y-2 px-4">
        <NotificationBanner
          title="Thông tin"
          description="Xem lại lịch sử các giao dịch đổi quà đã thực hiện trong ca làm việc hiện tại."
          type="info"
        />
      </div>
      <div className="flex justify-end px-4 mb-4">
        <div className="px-4 ">
          <Button
            variant="tertiary"
            size="small"
            onClick={fetchRedemptionHistory}
            disabled={loading}
            className="w-full"
            icon={Icons.Search}
          >
            Làm mới dữ liệu
          </Button>
        </div>
      </div>
      <div className="flex h-full flex-col">
       
        {/* Danh sách lịch sử */}
        <div className="flex-1 overflow-auto p-4">
          {redemptionHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Icons.Information className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-center text-sm">Chưa có lịch sử đổi quà nào</p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Các giao dịch đổi quà sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {redemptionHistory.map((session) => (
                <div
                  key={session.id}
                  className="relative bg-white border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {session.customerName}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {session.customerPhone}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <span className="text-gray-700 line-clamp-1">
                        {formatProducts(session.products)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className="text-gray-700 line-clamp-1">
                        {formatGifts(session.gifts)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết session */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className=" text-gray-900">Chi tiết giao dịch</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="p-4 space-y-4">
                {/* Thông tin khách hàng */}
                <div >
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tên khách hàng:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSession.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Số điện thoại:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSession.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mã OTP:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSession.otpCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Thời gian tạo:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedSession.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                        {getStatusText(selectedSession.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Sản phẩm đã mua */}
                <div >
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    Sản phẩm
                  </h4>
                  <div>
                    <table className="min-w-full divide-y divide-gray-200 border rounded">
                       <thead>
                         <tr>
                           <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tên sản phẩm</th>
                           <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Số lượng</th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {Object.entries(selectedSession.products)
                           .filter(([_, quantity]) => quantity > 0)
                           .map(([sku, quantity]) => (
                             <tr key={sku}>
                               <td className="px-4 py-2 text-sm text-gray-700">
                                 {productConfig[sku as keyof typeof productConfig]?.name || sku}
                               </td>
                               <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{quantity}</td>
                             </tr>
                           ))}
                         {Object.entries(selectedSession.products).filter(([_, quantity]) => quantity > 0).length === 0 && (
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
                <div >
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    Quà tặng
                  </h4>

                  <div>
                    <table className="min-w-full divide-y divide-gray-200 border rounded">
                       <thead>
                         <tr>
                           <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tên quà tặng</th>
                           <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Số lượng</th>
                         </tr>
                       </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                         {Object.entries(selectedSession.gifts)
                           .filter(([_, quantity]) => quantity > 0)
                           .map(([giftId, quantity]) => (
                             <tr key={giftId}>
                               <td className="px-4 py-2 text-sm text-gray-700">
                                 {giftSchemes[giftId as keyof typeof giftSchemes]?.name || giftId}
                               </td>
                               <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{quantity}</td>
                             </tr>
                           ))}
                         {Object.entries(selectedSession.gifts).filter(([_, quantity]) => quantity > 0).length === 0 && (
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
                {selectedSession.billImage && (
                  <div >
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      Hình khách mua hàng
                    </h4>
                    <div className="bg-white border p-2">
                      <img
                        src={AppConfig.imageDomain + selectedSession.billImage}
                        alt="Hình khách mua hàng"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <Button
                variant="tertiary"
                onClick={() => setSelectedSession(null)}
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