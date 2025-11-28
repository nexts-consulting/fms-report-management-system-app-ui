import { cssClamp } from "@/kits/utils/common.util";
import { motion } from "framer-motion";
import { Svgs } from "../svgs";
import { Icons } from "@/kits/components/Icons";
import { useEffect, useState } from "react";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";

interface CompleteScreenProps {
  screenType: "survey" | "gift";
}

export const CompleteScreen = (props: CompleteScreenProps) => {
  const { screenType } = props;
  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const resetProgress = surveyProgress.use.resetProgress();
  const surveyFlow = surveyProgress.use.surveyFlow();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();

  const [surveyData, setSurveyData] = useState<any>(null);
  const [giftInfo, setGiftInfo] = useState<any>(null);
  const [giftsData, setGiftsData] = useState<any>(null);
  useEffect(() => {
    // Lấy dữ liệu từ tất cả sources để support cả quick và full flow
    const completeSurveyData = localStorage.getItem("completeSurveyData");
    const infoData = localStorage.getItem("surveyInfo");
    const gamesData = localStorage.getItem("surveyGames");
    const giftsData = localStorage.getItem("luckyWheelRewards");
    const otpData = localStorage.getItem("surveyOTP");
    const giftInfo = localStorage.getItem("giftInfo");
    let combinedData: any = {};
   
    if (giftsData) {
      setGiftsData(JSON.parse(giftsData));
    }
    if (giftInfo) {
      setGiftInfo(JSON.parse(giftInfo));
    }

    // Nếu có completeSurveyData (full flow)
    if (completeSurveyData) {
      combinedData = JSON.parse(completeSurveyData);
    } else {
      // Nếu không có (quick flow), tạo structure tương tự
      combinedData = {
        info: infoData ? JSON.parse(infoData) : null,
        survey: null, // Quick flow không có survey
        completedAt: new Date().toISOString(),
      };
    }

    // Thêm games data
    if (gamesData) {
      combinedData.games = JSON.parse(gamesData);
    }

    // Thêm gifts data (chỉ cho quick/full flow, không cho no-games flow)
    if (giftsData) {
      try {
        combinedData.gifts = JSON.parse(giftsData);
      } catch (error) {
        console.error("Error loading gifts data:", error);
      }
    }

    // Thêm survey flow information
    combinedData.surveyFlow = surveyFlow;
    combinedData.surveyMode = surveyMode;

    // Thêm OTP data nếu có
    if (otpData) {
      combinedData.otp = otpData;
      combinedData.authorizeMethod = "OTP";
    } else {
      combinedData.authorizeMethod = "Camera";
    }

    // Debug: Log dữ liệu combined
    console.log("Combined survey data:", combinedData);

    setSurveyData(combinedData);

    // Đánh dấu step complete đã hoàn thành
    markStepComplete("complete");
  }, [markStepComplete]);

  const handleStartNewTurn = () => {
    // Xóa dữ liệu cũ - bao gồm OTP data
    localStorage.removeItem("surveyInfo");
    localStorage.removeItem("surveyImage");
    localStorage.removeItem("surveyImageFile");
    localStorage.removeItem("surveyGames");
    localStorage.removeItem("completeSurveyData");
    localStorage.removeItem("luckyWheelRewards");
    localStorage.removeItem("surveyOTP");
    localStorage.removeItem("giftInfo");
    localStorage.removeItem("giftGames");
    localStorage.removeItem("luckyWheelRewards");
    localStorage.removeItem("gift-progress-storage");
    if (screenType === "survey") {
      // Reset progress
      resetProgress();
      setCurrentStep("info");
    }
    else if (screenType === "gift") {
      resetProgress();
      setCurrentStep("gift-check-phone");
    }

  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="inset-0 mx-auto flex h-dvh max-w-3xl flex-col items-center justify-start space-y-8 px-4 pb-16 pt-6">
        <div
          className="relative z-[2] mx-auto flex w-full items-center justify-center"
          style={{
            width: cssClamp(120, 200, 250, 500),
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            <Svgs.VinamilkLogo className="fill-white" />
            <p
              className="translate-y-[-30%] text-center font-vnm-sans-display uppercase leading-none text-white"
              style={{ fontSize: cssClamp(32, 48, 250, 500) }}
            >
              Probi
            </p>
          </motion.div>
        </div>

        {/* Nội dung chính */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-1 flex-col items-center justify-start px-2 pb-16 text-center"
        >

          {/* Thông tin cảm ơn */}
          <div className="mb-6 w-full max-w-md space-y-3 text-white">
            {(surveyData?.info || giftInfo) && (
              <div className="bg-black/40 p-4 text-left backdrop-blur-sm">
                <p className="mb-2 font-semibold text-white">Thông tin đã đăng ký:</p>
                <div className="space-y-1 text-sm text-white/90">
                  <div className="inline-flex justify-between gap-2">
                    <p className="grow">
                      <strong>Tên:</strong>{" "}
                      <span className="text-[#e7f9a1]">{surveyData.info?.fullName || giftInfo.name}</span>
                    </p>
                    <p className="grow">
                      <strong>Số điện thoại:</strong>{" "}
                      <span className="text-[#e7f9a1]">{surveyData.info?.phoneNumber || giftInfo.phoneNumber}</span>
                    </p>
                  </div>

                  <p>
                    <strong>Hoàn thành:</strong>{" "}
                    <span className="text-[#e7f9a1]">
                      {new Date(surveyData.completedAt).toLocaleString("vi-VN")}
                    </span>
                  </p>
                  {(screenType === "survey") ? (
                    <div className="py-2">
                      <div className="bg-gradient-to-r from-[#ffffff] to-[#ffffff] p-4 text-center">
                        <p
                          className="mb-1 font-vnm-sans-display leading-none text-[#0213b0]"
                          style={{ fontSize: cssClamp(24, 32, 250, 500) }}
                        >
                          Chúc mừng!
                        </p>
                        <p
                          className="font-vnm-sans-display leading-none text-[#0213b0]"
                          style={{ fontSize: cssClamp(16, 24, 250, 500) }}
                        >
                          Bạn nhận được 1 vé tham gia chơi TRÒ CHƠI LIÊN HOÀN
                        </p>
                      </div>
                    </div>
                  ) : (
                     screenType === "gift" && (
                      <>
                        <p className="mb-2 font-semibold text-white">Quà đã nhận được:</p>
                        <div className="space-y-1">
                          {giftsData?.map((gift: any, index: number) => (
                            <div
                              key={`${gift.id}-${index}`}
                              className="flex items-center space-x-3"
                            >
                              <span className="text-sm text-[#e5ff7c]">- {gift.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Thank you message - conditional dựa trên flow */}
            <div className="bg-black/40 p-4 backdrop-blur-sm">
              {(screenType === "survey") ? (
                <>
                  <p className="mb-2 font-semibold text-white">Cảm ơn bạn đã tham gia!</p>
                  <p className="text-sm text-white/90">
                    Cảm ơn bạn đã hoàn thành khảo sát! Vé chơi Trò chơi liên hoàn của bạn đã sẵn
                    sàng. Hãy quay lại tham gia các trò chơi thú vị và nhận thêm nhiều phần quà hấp
                    dẫn!
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2 font-semibold text-white">Cảm ơn bạn đã tham gia!</p>
                  <p className="text-sm text-white/90">
                    Chúc mừng bạn đã hoàn thành các hoạt động tại nơi này và nhận được phần quà hấp dẫn. 
                    Nếu có thắc mắc, vui lòng liên hệ nhân viên của chúng tôi để được hỗ trợ.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Button hoàn thành */}
          <div className="flex items-center justify-center">
            <button
              className="rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
              style={{ fontSize: cssClamp(24, 36, 250, 500) }}
              onClick={handleStartNewTurn}
            >
              Hoàn thành
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
