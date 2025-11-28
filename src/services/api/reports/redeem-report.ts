import { axiosApi } from "@/libs/axios";

export interface RedeemReportRequest {
  staffAttendanceId: number;
  customerPhone: string;
  customerName: string;
  otpCode: string;
  products: Record<string, number>;
  gifts: Record<string, number>;
  invoiceImage: File;
  workShift?: number | null;
  saleReportBy?: string | null;
}

export interface SendOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface RedeemReportResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
}

export interface GiftRedemptionSession {
  id: number;
  customerName: string;
  customerPhone: string;
  otpCode: string;
  invoiceNumber?: string | null;
  invoiceTotal?: number | null;
  billImage?: string | null;
  isValid?: boolean | null;
  adminNote?: string | null;
  status: string;
  gifts: Record<string, number>;
  products: Record<string, number>;
  createdAt: string;
}

export interface GiftRedemptionHistoryResponse {
  message: string;
  status: number;
  data: GiftRedemptionSession[];
}

export const redeemReportApi = {
  // Gửi mã OTP
  sendOtp: async (data: SendOtpRequest): Promise<RedeemReportResponse> => {
    const response = await axiosApi.post("/sms/send-customer-otp", data);
    return response.data;
  },

  // Xác thực mã OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<RedeemReportResponse> => {
    const response = await axiosApi.post("/gift-redemption/verify-otp", data);
    return response.data;
  },

  // Submit redeem report
  submitReport: async (data: RedeemReportRequest): Promise<RedeemReportResponse> => {
    const formData = new FormData();
    formData.append("customerPhone", data.customerPhone);
    formData.append("customerName", data.customerName);
    formData.append("staffAttendanceId", data.staffAttendanceId.toString());
    formData.append("otpCode", data.otpCode);
    formData.append("products", JSON.stringify(data.products));
    formData.append("gifts", JSON.stringify(data.gifts));
    formData.append("invoiceImage", data.invoiceImage);
    formData.append("workShift", data.workShift?.toString() || "");
    formData.append("saleReportBy", data.saleReportBy || "");
    const response = await axiosApi.post("/customer-data/submit-sale-report", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Lấy lịch sử đổi quà theo staff attendance
  getRedemptionHistory: async (staffAttendanceId: number): Promise<GiftRedemptionHistoryResponse> => {
    const response = await axiosApi.get("gift-redemption/gift-redemption-sessions-by-staff-attendance", {
      params: {
        staffAttendanceId,
      },
    });
    return response.data;
  },
};
