"use client";

import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { cssClamp } from "@/kits/utils";
import { motion } from "framer-motion";
import { Svgs } from "../svgs";

export interface FlowChoiceScreenProps {}

export const FlowChoiceScreen = (props: FlowChoiceScreenProps) => {
  const {} = props;

  const surveyProgress = useSurveyProgressContext();
  const setSurveyFlow = surveyProgress.use.setSurveyFlow();
  const setCurrentStep = surveyProgress.use.setCurrentStep();

  const handleSurveyChoice = () => {
    // Luồng đầy đủ: làm khảo sát
    setSurveyFlow("full");
    setCurrentStep("questions");
  };

  const handleQuickChoice = () => {
    // Luồng nhanh: quay quà ngay
    setSurveyFlow("quick");
    setCurrentStep("lucky-wheel");
  };

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

        <div className="relative z-[2]">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center font-vnm-sans-display uppercase leading-none text-white"
            style={{
              fontSize: cssClamp(40, 52, 250, 500),
            }}
          >
            Bạn muốn?
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full space-y-8 pb-16"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="grow rounded-full bg-white px-16 py-5 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
                style={{ fontSize: cssClamp(24, 36, 250, 500) }}
                onClick={handleSurveyChoice}
              >
                🎯 Tham gia khảo sát
              </button>
            </div>
            <div className="text-center text-sm text-white/90">
              <p className="text-base font-semibold">2 lần quay - Cơ hội gấp đôi!</p>
              <p className="mt-1 text-sm font-medium">Trả lời vài câu hỏi ngắn về sản phẩm</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="h-[1px] w-full bg-white/50" />
            <p className="px-4 text-sm font-semibold uppercase text-white/80">HOẶC</p>
            <div className="h-[1px] w-full bg-white/50" />
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              className="grow rounded-full bg-white px-16 py-5 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
              style={{ fontSize: cssClamp(24, 36, 250, 500) }}
              onClick={handleQuickChoice}
            >
              🎁 Quay quà ngay
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};
