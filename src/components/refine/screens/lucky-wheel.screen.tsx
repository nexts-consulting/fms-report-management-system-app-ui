"use client";

import { cssClamp } from "@/kits/utils";
import { motion } from "framer-motion";
import { Svgs } from "../svgs";
import { IGiftConfig, LuckyWheel } from "@/components/LuckyWheel";
import { useEffect, useState } from "react";
import Realistic from "react-canvas-confetti/dist/presets/realistic";
import Pride from "react-canvas-confetti/dist/presets/pride";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";

export interface LuckyWheelScreenProps {}

const defaultGiftImage = "/images/gift-1.png";

export const giftConfig: IGiftConfig[] = [
  {
    gift: {
      id: "1",
      code: "1",
      label: "Chén sứ",
      ratio: 30,
      image_url: "",
    },
  },
  {
    gift: {
      id: "2",
      code: "2",
      label: "Túi mỹ phẩm",
      ratio: 20,
      image_url: "",
    },
  },
  {
    gift: {
      id: "3",
      code: "3",
      label: "Bộ dụng cụ học tập",
      ratio: 10,
      image_url: "",
    },
  },
  {
    gift: {
      id: "4",
      code: "4",
      label: "SCU Probi",
      ratio: 40,
      image_url: "",
    },
  },
];

export const LuckyWheelScreen = (props: LuckyWheelScreenProps) => {
  const {} = props;

  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const getSpinCount = surveyProgress.use.getSpinCount();
  const surveyFlow = surveyProgress.use.surveyFlow();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();

  const [showRewardConfetti, setShowRewardConfetti] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(0);
  const [rewardGifts, setRewardGifts] = useState<IGiftConfig["gift"][]>([]);
  const [currentReward, setCurrentReward] = useState<IGiftConfig["gift"] | null>(null);
  const [showCurrentReward, setShowCurrentReward] = useState(false);

  // Khởi tạo số lần quay dựa trên luồng và load dữ liệu đã lưu
  useEffect(() => {
    const totalSpins = getSpinCount();

    // Load dữ liệu quà đã nhận từ localStorage
    const savedGifts = localStorage.getItem("luckyWheelRewards");
    if (savedGifts) {
      try {
        const gifts = JSON.parse(savedGifts);
        setRewardGifts(gifts);
        // Tính số lượt còn lại dựa trên số quà đã nhận
        setSpinsRemaining(Math.max(0, totalSpins - gifts.length));
      } catch (error) {
        console.error("Error loading saved gifts:", error);
        setSpinsRemaining(totalSpins);
      }
    } else {
      setSpinsRemaining(totalSpins);
    }
  }, [getSpinCount]);

  // Lưu thông tin quà vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (rewardGifts.length > 0) {
      localStorage.setItem("luckyWheelRewards", JSON.stringify(rewardGifts));
    }
  }, [rewardGifts]);

  // Đánh dấu step lucky-wheel đã hoàn thành khi hết lượt quay
  useEffect(() => {
    if (spinsRemaining === 0 && !showCurrentReward && !currentReward && rewardGifts.length > 0) {
      markStepComplete("lucky-wheel");
      setCurrentStep("complete");
    }
  }, [
    spinsRemaining,
    rewardGifts.length,
    markStepComplete,
    showCurrentReward,
    currentReward,
    setCurrentStep,
  ]);

  return (
    <>
      <LoadingOverlay active={false} />
      <div className="absolute inset-0 mx-auto flex h-dvh max-w-3xl flex-col items-center justify-start space-y-4 overflow-auto px-4 pb-16 pt-4">
        <div className="w-full space-y-2">
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
          <motion.div
            initial={{ opacity: 0, y: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-[500] w-full text-center"
          >
            <p className="text-base font-semibold text-white">
              Còn lại <span className="text-xl font-bold text-[#e5ff7c]">{spinsRemaining}</span>{" "}
              lượt quay
            </p>
          </motion.div>
        </div>

        {showCurrentReward && currentReward && (
          <motion.div
            initial={{ scale: 0, opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ scale: 1, opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ scale: 0, opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ type: "spring", mass: 0.5, stiffness: 100, damping: 15 }}
            className="fixed inset-0 top-[23%] z-[600] mx-3 h-fit"
            onClick={() => {
              setShowCurrentReward(false);
              setCurrentReward(null);
            }}
          >
            <div className="border-2 border-[#e5ff7c] bg-black/30 px-6 py-8">
              <p className="mb-5 text-center text-lg font-medium text-white">Bạn đã nhận được!</p>

              <div className="flex flex-col items-center justify-center gap-4 bg-black/20 p-4">
                <motion.img
                  src={currentReward?.image_url || defaultGiftImage}
                  alt={currentReward.label}
                  className="h-24 w-24 shrink-0 object-contain"
                  animate={{
                    rotate: [0, -5, 5, -5, 5, 0],
                    scale: [1, 1.05, 1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#e5ff7c]">{currentReward.label}</h3>
                </div>
              </div>

              <p className="mt-5 animate-pulse text-center text-sm font-semibold text-white">
                Nhấn để {spinsRemaining > 0 ? "tiếp tục" : "kết thúc"}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto h-fit w-full max-w-[300px]"
        >
          <LuckyWheel
            onPickedGift={(giftConfig) => {
              setTimeout(() => {
                // Hiển thị thông báo quà vừa nhận
                setCurrentReward(giftConfig.gift);
                setShowCurrentReward(true);

                // Thêm quà vào danh sách tổng
                setRewardGifts((prev) => [...prev, giftConfig.gift]);

                // Giảm số lượt quay
                setSpinsRemaining((prev) => prev - 1);

                setShowRewardConfetti(true);
                setTimeout(() => {
                  setShowRewardConfetti(false);
                }, 8000);
              }, 1500);
            }}
            giftsConfig={giftConfig}
            selectedGiftCode="4"
            disableSpin={spinsRemaining === 0}
            textDistanceFromCenter={50}
          />
        </motion.div>

        {showRewardConfetti && (
          <div className="pointer-events-none fixed z-[999] select-none">
            <Realistic autorun={{ speed: 1, duration: 5000, delay: 0 }} />
            <Pride autorun={{ speed: 2, duration: 5000, delay: 0 }} />
          </div>
        )}

        {showRewardConfetti && (
          <div className="fixed z-[999]">
            <Realistic autorun={{ speed: 1, duration: 5000, delay: 0 }} />
            <Pride autorun={{ speed: 2, duration: 5000, delay: 0 }} />
          </div>
        )}
      </div>
    </>
  );
};
