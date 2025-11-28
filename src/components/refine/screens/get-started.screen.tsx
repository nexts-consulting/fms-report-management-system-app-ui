"use client";

import { motion } from "framer-motion";
import { Svgs } from "../svgs";
import { cssClamp } from "@/kits/utils";
import Image from "next/image";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";

interface GetStartedScreenProps {}

export const GetStartedScreen = (props: GetStartedScreenProps) => {
  const {} = props;

  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const setCurrentStep = surveyProgress.use.setCurrentStep();

  const handleStart = () => {
    markStepComplete("info");
    setCurrentStep("info");
  };

  return (
    <div className="absolute inset-0 mx-auto h-dvh max-w-3xl overflow-hidden">
      <div
        className="relative z-[2] mx-auto flex w-full items-center justify-center"
        style={{
          paddingTop: cssClamp(32, 48, 250, 500),
          paddingBottom: cssClamp(32, 48, 250, 500),
          width: cssClamp(120, 200, 250, 500),
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: "-50%" }}
          animate={{ opacity: 1, y: 0 }}
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
          className="text-center font-vnm-sans-display uppercase leading-none"
          style={{
            fontSize: cssClamp(72, 96, 250, 500),
          }}
        >
          Nhận diện <br /> Người chơi
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-[2] mt-6 space-y-4"
      >
        <div className="flex items-center justify-center">
          <button
            className="rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
            style={{ fontSize: cssClamp(24, 36, 250, 500) }}
            onClick={handleStart}
          >
            Bắt đầu
          </button>
        </div>
        <p className="px-8 text-center text-xs text-white/80">
          Hoàn thành để nhận quà tặng hấp dẫn từ Vinamilk
        </p>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-[1]">
        <div className="grid w-full grid-rows-5" style={{ height: cssClamp(96, 164, 250, 500) }}>
          {["#f15d7f", "#f2a9c4", "#d2fb84", "#51df2f", "#fff7ab"].map((color, index) => (
            <motion.div
              key={index}
              className="row-span-1"
              style={{ backgroundColor: color }}
              initial={{
                y: 100,
                opacity: 0,
                transformOrigin: "center",
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                delay: index * 0.05 + 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
        </div>
        <motion.div
          className="absolute -left-4 bottom-8 aspect-square w-[45%]"
          initial={{
            y: 150,
            opacity: 0,
            scale: 0.8,
            rotate: -5,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 1.2,
            delay: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            rotate: {
              duration: 0.8,
              delay: 1.2,
              ease: "easeOut",
            },
          }}
        >
          <div className="relative h-full w-full">
            <Image
              src="/images/decor-2.webp"
              alt="Decor 2"
              width={500}
              height={300}
              loading="eager"
              priority
              className="brightness- h-full w-full object-contain"
            />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-8 right-0 aspect-square w-[55%]"
          initial={{
            y: 150,
            opacity: 0,
            scale: 0.8,
            rotate: 5,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 1.2,
            delay: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            rotate: {
              duration: 0.8,
              delay: 1.5,
              ease: "easeOut",
            },
          }}
        >
          <div className="relative h-full w-full">
            <Image
              src="/images/decor-3.webp"
              alt="Decor 3"
              width={500}
              height={300}
              loading="eager"
              priority
              className="brightness- h-full w-full object-contain"
            />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-[28vh] left-12 aspect-square w-[18%]"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            delay: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div className="relative h-full w-full">
            <Image
              src="/images/decor-4.webp"
              alt="Decor 3"
              width={500}
              height={300}
              loading="eager"
              priority
              className="brightness- h-full w-full object-contain"
            />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-[30vh] right-12 aspect-square w-[20%]"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            delay: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div className="relative h-full w-full">
            <Image
              src="/images/decor-5.webp"
              alt="Decor 3"
              width={500}
              height={300}
              loading="eager"
              priority
              className="brightness- h-full w-full object-contain"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
