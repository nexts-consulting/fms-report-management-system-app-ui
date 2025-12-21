import { useEffect } from "react";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
export const useResetOnRefresh = () => {
  const surveyProgress = useSurveyProgressContext();
  const resetProgress = surveyProgress.use.resetProgress();

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Xóa toàn bộ dữ liệu survey khi refresh/đóng tab
      localStorage.removeItem("surveyInfo");
      localStorage.removeItem("surveyOTP");
      localStorage.removeItem("surveyImage");
      localStorage.removeItem("surveyGames");
      localStorage.removeItem("completeSurveyData");
      localStorage.removeItem("luckyWheelRewards");

      localStorage.removeItem("giftInfo");
      localStorage.removeItem("giftGames");

      // Reset survey progress store
      resetProgress();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [resetProgress]);
};
