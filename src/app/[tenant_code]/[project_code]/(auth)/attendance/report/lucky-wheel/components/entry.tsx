"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { IGiftConfig, LuckyWheel } from "@/components/LuckyWheel";
import { useRouter } from "next/navigation";
import Realistic from "react-canvas-confetti/dist/presets/realistic";
import Pride from "react-canvas-confetti/dist/presets/pride";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

const giftConfig: IGiftConfig[] = [
  {
    gift: {
      id: "1",
      code: "1",
      label: "Hộp quà tặng màu hồng",
      image_url: "/images/gift-1.png",
      ratio: 30,
    },
    order: 1,
    quantity: 2,
    stock: 2,
  },
  {
    gift: {
      id: "2",
      code: "2",  
      label: "Hộp quà tặng màu xanh",
      image_url: "/images/gift-2.png",
      ratio: 20,
    },
    order: 2,
    quantity: 2,
    stock: 2,
  },
  {
    gift: {
      id: "3",
      code: "3",
      label: "Hộp quà tặng cầu vồng",
      image_url: "/images/gift-3.png",
      ratio: 10,
    },
    order: 3,
    quantity: 2,
    stock: 2,
  },
  {
    gift: {
      id: "4",
      code: "4",
      label: "Hộp quà tặng màu tím",
      image_url: "/images/gift-4.png",
      ratio: 40,
    },
    order: 4,
    quantity: 2,
    stock: 2,
  },
];

export const Entry = () => {
  const [rewardGift, setRewardGift] = useState<IGiftConfig["gift"] | null>(null);
  const [showRewardConfetti, setShowRewardConfetti] = useState(false);

  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <div className="relative z-[1000]">
          <ScreenHeader
            title="Lucky Wheel - Demo Feature Only"
            loading={false}
            onBack={() => router.replace(buildPath("/attendance/tracking"))}
            containerClassName="mb-0"
          />
        </div>

        {rewardGift && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", mass: 0.5, stiffness: 100, damping: 5 }}
            className="relative z-[500] mx-6 mb-12 mt-[20vh] rounded-xl border-[3px] border-gold-400 bg-black/30 px-6 py-6 shadow-lg backdrop-blur-[24px]"
          >
            <h1 className="text-center text-base text-white">
              Chúc mừng bạn đã nhận được phần quà:
            </h1>

            <div className="flex items-center justify-center text-center">
              <h2 className="mt-2 text-xl font-medium leading-[32px] text-white">
                {rewardGift.label}
              </h2>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <img
                src={rewardGift.image_url}
                alt={rewardGift.label}
                className="max-h-[15vh] min-h-[100px] w-auto object-contain object-center"
              />
            </div>

            <div className="flex items-center justify-center text-center">
              <p className="mt-2 bg-gradient-to-b from-white to-white bg-clip-text text-sm font-medium leading-[24px] text-transparent">
                Vui lòng liên hệ nhân viên bán hàng tại booth để đổi quà
              </p>
            </div>
          </motion.div>
        )}

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

        <LuckyWheel
          onPickedGift={(giftConfig) => {
            if (!rewardGift) {
              setTimeout(() => {
                setRewardGift(giftConfig.gift);
              }, 1000);
            }

            setTimeout(() => {
              setShowRewardConfetti(true);
              setTimeout(() => {
                setShowRewardConfetti(false);
              }, 10000);
            }, 1500);
          }}
          giftsConfig={giftConfig}
        />
      </div>
    </>
  );
};
