import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { useEffect } from "react";

export const useGiftSessionReset = () => {
  const surveyProgress = useSurveyProgressContext();
  const resetProgress = surveyProgress.use.resetProgress();

  useEffect(() => {
    // Kiểm tra xem có phải là session mới không
    const sessionFlag = sessionStorage.getItem("giftSessionActive");

    // Nếu không có flag trong sessionStorage (tức là tab mới hoặc refresh)
    if (!sessionFlag) {
      // Clear tất cả dữ liệu survey
      localStorage.removeItem("giftInfo");
      localStorage.removeItem("giftGames");

      // Reset survey progress store
      resetProgress();

      // Đánh dấu session đã active
      sessionStorage.setItem("giftSessionActive", "true");
    }
  }, [resetProgress]);
};
