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

interface GiftGamesScreenProps {}

const gamesSchema = z
  .object({
    games: z.array(z.string()),
    hasPlayedGames: z.boolean().optional(), // Để track xem user có chơi games không
  })
  .refine(
    (data) => {
      // Phải chọn ít nhất một trò chơi HOẶC chọn "Chưa tham gia game nào"
      return data.games.length > 1 || data.hasPlayedGames === false;
    },
    {
      message: "Vui lòng chọn ít nhất một trò chơi hoặc chọn 'Chưa tham gia game nào'",
      path: ["games"], // Hiển thị lỗi ở field games
    },
  );

type GamesSchema = z.infer<typeof gamesSchema>;

export const GiftGamesScreen = (props: GiftGamesScreenProps) => {
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
      localStorage.setItem("giftGames", JSON.stringify(gameData));

      markStepComplete("gift-games");

      setTimeout(() => {
        setFakeLoading(false);
        setCurrentStep("gift-lucky-wheel");
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
      <div className="flex h-dvh flex-col items-center justify-start space-y-8 px-4 pb-16 pt-6">
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
                  disabled={fakeLoading || (!hasNotPlayedGames && formMethods.watch("games").length < 2)}
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
