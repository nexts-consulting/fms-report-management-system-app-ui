import { CheckboxGroupInput } from "@/kits/components/CheckboxGroupInput";
import { cn, cssClamp } from "@/kits/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { FormErrorMessage } from "../form-error-message";
import { CheckIcon } from "lucide-react";
import CaroBorder from "../caro-border";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { Svgs } from "../svgs";

interface GamesScreenProps {}

const gamesSchema = z
  .object({
    games: z.array(z.string()),
    hasPlayedGames: z.boolean().optional(), // Để track xem user có chơi games không
  })
  .refine(
    (data) => {
      // Phải chọn ít nhất một trò chơi HOẶC chọn "Chưa tham gia game nào"
      return data.games.length > 0 || data.hasPlayedGames === false;
    },
    {
      message: "Vui lòng chọn ít nhất một trò chơi hoặc chọn 'Chưa tham gia game nào'",
      path: ["games"], // Hiển thị lỗi ở field games
    },
  );

type GamesSchema = z.infer<typeof gamesSchema>;

export const GamesScreen = (props: GamesScreenProps) => {
  const {} = props;

  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const setSurveyFlow = surveyProgress.use.setSurveyFlow();

  const [fakeLoading, setFakeLoading] = useState(false);

  const formMethods = useForm<GamesSchema>({
    resolver: zodResolver(gamesSchema),
    defaultValues: {
      games: [],
      hasPlayedGames: undefined,
    },
  });

  const [hasNotPlayedGames, setHasNotPlayedGames] = useState(false);

  // Danh sách các trò chơi
  const gameOptions = [
    { label: "Mê Cung Tiêu Hóa", value: "me-cung-tieu-hoa" },
    { label: "Biệt đội đánh bay cảm cúm", value: "biet-doi-danh-bay-cam-cum" },
    { label: "Đường Lợi khuẩn khổng lồ", value: "duong-loi-khuan-khong-lo" },
  ];

  // Handle selection of "chưa tham gia game nào"
  const handleNotPlayedGamesChange = (checked: boolean) => {
    setHasNotPlayedGames(checked);
    if (checked) {
      // Nếu chọn "chưa tham gia", xóa tất cả games đã chọn
      formMethods.setValue("games", []);
      formMethods.setValue("hasPlayedGames", false);
    } else {
      formMethods.setValue("hasPlayedGames", undefined);
    }
  };

  // Handle selection of individual games
  const handleGameSelection = (selectedGames: string[]) => {
    if (selectedGames.length > 0) {
      // Nếu chọn games, bỏ check "chưa tham gia"
      setHasNotPlayedGames(false);
      formMethods.setValue("hasPlayedGames", true);
    }
    formMethods.setValue("games", selectedGames);
  };

  const handleFormSubmit: SubmitHandler<GamesSchema> = async (data) => {
    try {
      setFakeLoading(true);

      // Save game data
      const gameData = {
        ...data,
        hasPlayedGames: hasNotPlayedGames ? false : data.games.length > 0,
      };
      localStorage.setItem("surveyGames", JSON.stringify(gameData));

      markStepComplete("games");

      setTimeout(() => {
        setFakeLoading(false);
        if (hasNotPlayedGames) {
          // Nếu chưa tham gia game nào -> bắt buộc làm khảo sát
          setCurrentStep("questions");
        } else {
          // Nếu đã tham gia games -> cho lựa chọn flow
          setSurveyFlow("quick");
          setCurrentStep("questions");
        }
      }, 1000);
    } catch (error) {}
  };

  const handleFormOnInvalid: SubmitErrorHandler<GamesSchema> = (error) => {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <LoadingOverlay active={fakeLoading} />
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
            Trò chơi đã tham gia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-3 text-center font-vnm-sans-display leading-none text-white"
            style={{
              fontSize: cssClamp(20, 28, 250, 500),
            }}
          >
            Hãy cho chúng tôi biết bạn đã tham gia những trò chơi nào
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="h-fit w-full pb-16"
        >
          <CaroBorder
            borderRows={2}
            squareSize={4}
            color1="#050ba9"
            color2="#FFFFFF"
            className="bg-[#050ba9]"
          >
            <form
              className="w-full space-y-8 px-4 py-8"
              onSubmit={formMethods.handleSubmit(handleFormSubmit, handleFormOnInvalid)}
            >
              <div className="space-y-4">
                {/* Games Selection */}
                <div className="w-full space-y-2">
                  <div>
                    <Controller
                      control={formMethods.control}
                      name="games"
                      render={({ field }) => (
                        <CheckboxGroupInput
                          options={gameOptions}
                          multiple={true}
                          grid={1}
                          value={field.value}
                          onChange={handleGameSelection}
                          error={!!formMethods.formState.errors.games}
                          disabled={hasNotPlayedGames}
                        />
                      )}
                    />
                  </div>

                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-full bg-white p-3",
                        {
                          "bg-[#e7f9a1]": hasNotPlayedGames,
                        },
                      )}
                      onClick={() => handleNotPlayedGamesChange(!hasNotPlayedGames)}
                    >
                      <div
                        role="checkbox"
                        tabIndex={0}
                        aria-checked={hasNotPlayedGames}
                        data-checked={hasNotPlayedGames}
                        className="shrink-0"
                      >
                        {!hasNotPlayedGames && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-600 bg-white" />
                        )}
                        {hasNotPlayedGames && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              damping: 15,
                              stiffness: 300,
                              duration: 0.4,
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#6cec52] bg-[#6cec52]"
                          >
                            <CheckIcon className="h-4 w-4 text-[#050ba9]" />
                          </motion.div>
                        )}
                      </div>
                      <p
                        className={cn(
                          "line-clamp-2 cursor-pointer font-vnm-sans-display text-sm leading-none",
                          {
                            "text-[#050ba9]": hasNotPlayedGames,
                            "text-slate-600": !hasNotPlayedGames,
                          },
                        )}
                        style={{
                          fontSize: cssClamp(20, 24, 250, 500),
                        }}
                      >
                        Chưa tham gia game nào
                      </p>
                    </div>
                  </div>
                </div>
                <FormErrorMessage name="games" errors={formMethods.formState.errors} />
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className={cn(
                    "rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 enabled:hover:bg-blue-500 enabled:hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{ fontSize: cssClamp(24, 36, 250, 500) }}
                  disabled={fakeLoading}
                >
                  Tiếp tục
                </button>
              </div>
            </form>
          </CaroBorder>
        </motion.div>
      </div>
    </>
  );
};
