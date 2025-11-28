"use client";
import { LineCanvas } from "@/components/refine/line-canvas";
import { ScreenOverlayRef, ScreenOverlay } from "@/components/refine/screen-overlay";
import Footer from "@/components/refine/footer";
import { useEffect, useRef, useState } from "react";
import { GetStartedScreen } from "@/components/refine/screens/get-started.screen";
import { DiagonalCanvas } from "@/components/refine/diagonal-canvas";
import { InfoScreen } from "@/components/refine/screens/info.screen";
import { OtpScreen } from "@/components/refine/screens/otp.screen";
import { GamesScreen } from "@/components/refine/screens/games.screen";
import { CaroCanvas } from "@/components/refine/caro-canvas";
import { QuestionsScreen } from "@/components/refine/screens/questions.screen";
import { useGlobalContext } from "@/contexts/global.context";
import { GridCanvas } from "@/components/refine/grid-canvas";
import { LuckyWheelScreen } from "@/components/refine/screens/lucky-wheel.screen";
import { FlowChoiceScreen } from "@/components/refine/screens/flow-choice.screen";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { CompleteScreen } from "@/components/refine/screens/complete.screen";
import { CameraScreen } from "@/components/refine/screens/camera.screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useRouter } from "next/navigation";

export default function RefinePage() {
  const router = useRouter();
  const globalContext = useGlobalContext();
  const caroColors = globalContext.use.caroColors();

  const surveyProgress = useSurveyProgressContext();
  const currentSurveyStep = surveyProgress.use.currentStep();
  const setSurveyMode = surveyProgress.use.setSurveyMode();

  const [currentCanvas, setCurrentCanvas] = useState<number>(0);
  const screenOverlay = useRef<ScreenOverlayRef>(null);

  const resetProgress = surveyProgress.use.resetProgress();
  const setCurrentStep = surveyProgress.use.setCurrentStep();

  useEffect(() => {
    setSurveyMode("qr");
  }, []);

  useEffect(() => {
    setTimeout(() => {
      screenOverlay.current?.hide();
    }, 200);
  }, []);

  useEffect(() => {
    if (currentSurveyStep === "info") {
      screenOverlay.current?.show();
      setTimeout(() => {
        screenOverlay.current?.hide();
        setCurrentCanvas(1);
      }, 200);
    }

    if (currentSurveyStep === "questions") {
      screenOverlay.current?.show();
      setTimeout(() => {
        screenOverlay.current?.hide();
        setCurrentCanvas(2);
      }, 200);
    }

    if (currentSurveyStep === "lucky-wheel") {
      screenOverlay.current?.show();
      setTimeout(() => {
        screenOverlay.current?.hide();
        setCurrentCanvas(3);
      }, 200);
    }

    if (currentSurveyStep === "complete") {
      screenOverlay.current?.show();
      setTimeout(() => {
        screenOverlay.current?.hide();
        setCurrentCanvas(0);
      }, 200);
    }
  }, [currentSurveyStep]);

  const handleStartNewSurvey = () => {
    // Xóa dữ liệu cũ - bao gồm OTP data
    localStorage.removeItem("surveyInfo");
    localStorage.removeItem("surveyImage");
    localStorage.removeItem("surveyImageFile");
    localStorage.removeItem("surveyGames");
    localStorage.removeItem("completeSurveyData");
    localStorage.removeItem("luckyWheelRewards");
    localStorage.removeItem("surveyOTP");
    localStorage.removeItem("survey-progress-storage");
    // Reset progress
    resetProgress();

    // Chuyển về trang đầu
    setCurrentStep("info");

    router.push("/attendance/tracking");
  };

  return (
    <>
      <ScreenHeader
        title="Khảo sát"
        onBack={handleStartNewSurvey}
        wrapperClassName="bg-white/20 border-b border-b-white/20 backdrop-blur-[16px]"
        titleClassName="text-white"
        backButtonClassName="rounded-full"
      />
      <div className="flex h-full flex-col">
        <ScreenOverlay
          ref={screenOverlay}
          bgColor="#050ba9"
          duration={0.5}
          zIndex={-1}
          defaultVisible={true}
        />

        {currentCanvas === 0 && (
          <LineCanvas
            backgroundColor="#050ba9"
            lineColor="#092aba"
            direction="to-left"
            lineWidth={3}
            lineSpacing={30}
            speed={0.3}
          />
        )}
        {currentCanvas === 1 && (
          <DiagonalCanvas
            color1="#050ba9"
            color2="#3459ff"
            direction="to-bottom-right"
            size={40}
            speed={0.3}
          />
        )}
        {currentCanvas === 2 && (
          <CaroCanvas
            color1={caroColors[0]}
            color2={caroColors[1]}
            direction="to-bottom-left"
            squareSize={80}
            speed={0.3}
          />
        )}
        {currentCanvas === 3 && (
          <GridCanvas
            backgroundColor="#0212aa"
            gridColor="#3256f7"
            direction="to-bottom-left"
            gridWeight={2}
            gridSpacing={100}
            speed={0.3}
          />
        )}

        {/* <LoadingOverlay position="fixed" /> */}
        {currentSurveyStep === "info" && <InfoScreen />}
        {currentSurveyStep === "otp" && <OtpScreen />}
        {currentSurveyStep === "camera" && <CameraScreen />}
        {currentSurveyStep === "games" && <GamesScreen />}
        {currentSurveyStep === "flow-choice" && <FlowChoiceScreen />}
        {currentSurveyStep === "questions" && <QuestionsScreen />}
        {currentSurveyStep === "lucky-wheel" && <LuckyWheelScreen />}
        {currentSurveyStep === "complete" && <CompleteScreen screenType="survey" />}
      </div>
      <Footer />
    </>
  );
}
