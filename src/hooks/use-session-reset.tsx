import { useEffect } from "react";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";

export const useSessionReset = () => {
  const surveyProgress = useSurveyProgressContext();
  const resetProgress = surveyProgress.use.resetProgress();

  useEffect(() => {
    // Kiểm tra xem có phải là session mới không
    const sessionFlag = sessionStorage.getItem("surveySessionActive");

    // Nếu không có flag trong sessionStorage (tức là tab mới hoặc refresh)
    if (!sessionFlag) {
      // Clear tất cả dữ liệu survey
      localStorage.removeItem("surveyInfo");
      localStorage.removeItem("surveyImage");
      localStorage.removeItem("surveyGames");
      localStorage.removeItem("completeSurveyData");
      localStorage.removeItem("luckyWheelRewards");

      // Reset survey progress store
      resetProgress();

      // Đánh dấu session đã active
      sessionStorage.setItem("surveySessionActive", "true");
    }
  }, [resetProgress]);
};
