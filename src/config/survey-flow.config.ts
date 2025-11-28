/**
 * Cấu hình luồng khảo sát
 * Có thể thay đổi để switch giữa các luồng khác nhau
 */

export type SurveyFlowConfig = "otp" | "camera";

// Cấu hình hiện tại - có thể thay đổi để build lại
export const CURRENT_SURVEY_FLOW: SurveyFlowConfig = "otp"; // Thay đổi thành "otp" khi cần

// Flow configurations
export const FLOW_CONFIGS = {
  otp: {
    name: "OTP Flow",
    description: "Info -> OTP -> Games -> Flow-Choice",
    steps: ["info", "otp", "games", "flow-choice"] as const,
    requiresOtp: true,
    requiresCamera: false,
  },
  camera: {
    name: "Camera Flow",
    description: "Info -> Camera -> Games -> Flow-Choice",
    steps: ["info", "camera", "games", "flow-choice"] as const,
    requiresOtp: false,
    requiresCamera: true,
  },
} as const;

// Helper function để lấy config hiện tại
export function getCurrentFlowConfig() {
  return FLOW_CONFIGS[CURRENT_SURVEY_FLOW];
}

// Helper function để check xem có cần OTP không
export function requiresOTPStep(): boolean {
  return getCurrentFlowConfig().requiresOtp;
}

// Helper function để check xem có cần Camera không
export function requiresCameraStep(): boolean {
  return getCurrentFlowConfig().requiresCamera;
}
