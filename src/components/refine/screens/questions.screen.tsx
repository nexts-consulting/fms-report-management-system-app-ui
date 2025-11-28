import { FormErrorMessage } from "../form-error-message";
import { CheckboxGroupInput } from "@/kits/components/CheckboxGroupInput";
import { cn, cssClamp } from "@/kits/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import CaroBorder from "../caro-border";
import { useGlobalContext } from "@/contexts/global.context";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { SurveyService } from "@/services/firebase/firestore/survey.service";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useMutationSurveySave } from "@/services/api/survey/save";
import { Svgs } from "../svgs";

interface QuestionsScreenProps {}

const questionsSchema = z
  .object({
    q1_brands: z.array(z.string()).min(1, { message: "Vui lòng chọn ít nhất một câu trả lời" }),
    q2_frequent_brand: z.string().optional(),
    q3a_flavor_usage: z.array(z.string()).optional(),
    q3b_most_used_flavor: z.string().optional(),
  })
  .refine(
    (data) => {
      // If using SCU MS (not including "99"), Q3a is required
      const isUsingSCUMS = !data.q1_brands.includes("99") && data.q1_brands.length > 0;
      if (isUsingSCUMS) {
        return data.q3a_flavor_usage && data.q3a_flavor_usage.length > 0;
      }
      return true;
    },
    {
      message: "Vui lòng chọn ít nhất một vị sữa chua uống",
      path: ["q3a_flavor_usage"],
    },
  );

type QuestionsSchema = z.infer<typeof questionsSchema>;

// Helper functions để convert codes thành labels
const getBrandLabel = (code: string): string => {
  const brandMapping: Record<string, string> = {
    "1": "Probi",
    "2": "Yakult",
    "3": "Betagen",
    "4": "TH Probiotics",
    "5": "Nuvi",
    "99": "Đang không dùng các sản phẩm sữa chua uống men sống",
  };
  return brandMapping[code] || code;
};

const getFlavorLabel = (code: string): string => {
  const flavorMapping: Record<string, string> = {
    "vi-co-duong": "Vị Có đường",
    "vi-it-duong": "Vị Ít đường",
    "vi-khong-duong": "Vị Không đường",
    "vi-trai-cay": "Vị trái cây",
  };
  return flavorMapping[code] || code;
};

const getGameLabel = (code: string): string => {
  const gameMapping: Record<string, string> = {
    "me-cung-tieu-hoa": "Mê Cung Tiêu Hóa",
    "biet-doi-danh-bay-cam-cum": "Biệt đội đánh bay cảm cúm",
    "duong-loi-khuan-khong-lo": "Đường Lợi khuẩn khổng lồ",
  };
  return gameMapping[code] || code;
};

const getGenderLabel = (code: string): string => {
  const genderMapping: Record<string, string> = {
    "1": "Nam",
    "2": "Nữ",
    "0": "Không muốn ghi nhận",
  };
  return genderMapping[code] || code;
};

const getMaritalStatusLabel = (code: string): string => {
  const maritalMapping: Record<string, string> = {
    "1": "Chưa lập gia đình",
    "2": "Đã lập gia đình và có con",
    "3": "Đã lập gia đình và chưa có con",
  };
  return maritalMapping[code] || code;
};

export const QuestionsScreen = (props: QuestionsScreenProps) => {
  const {} = props;

  const globalContext = useGlobalContext();
  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const surveyFlow = surveyProgress.use.surveyFlow();
  const setSurveyFlow = surveyProgress.use.setSurveyFlow();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();

  const mutationSurveySave = useMutationSurveySave();

  const [loading, setLoading] = useState(false);

  const formMethods = useForm<QuestionsSchema>({
    resolver: zodResolver(questionsSchema),
    defaultValues: {
      q1_brands: [],
      q2_frequent_brand: "",
      q3a_flavor_usage: [],
      q3b_most_used_flavor: "",
    },
  });

  // Sử dụng useState thay vì watch để tránh re-render không cần thiết
  const [q1Brands, setQ1Brands] = useState<string[]>([]);
  const [q3aFlavorUsage, setQ3aFlavorUsage] = useState<string[]>([]);

  // Logic for Q2: Only show if Q1 has multiple selections and doesn't include "99"
  const shouldShowQ2 = useMemo(() => q1Brands.length > 1 && !q1Brands.includes("99"), [q1Brands]);

  // Logic for Q3A and Q3B: Only show if using SCU MS (Q1 or Q2 ≠ 99)
  const isUsingSCUMS = useMemo(() => !q1Brands.includes("99") && q1Brands.length > 0, [q1Brands]);

  // Logic for Q3b: Only show if Q3a has multiple selections (>= 2) AND using SCU MS
  const shouldShowQ3b = useMemo(
    () => q3aFlavorUsage.length >= 2 && isUsingSCUMS,
    [q3aFlavorUsage, isUsingSCUMS],
  );

  // Memoize options để tránh re-render không cần thiết
  const q1BrandsOptions = useMemo(
    () => [
      { label: "Probi", value: "1" },
      { label: "Yakult", value: "2" },
      { label: "Betagen", value: "3" },
      { label: "TH Probiotics", value: "4" },
      { label: "Nuvi", value: "5" },
      { label: "Đang không dùng các sản phẩm sữa chua uống men sống", value: "99" },
    ],
    [],
  );

  const q2FrequentBrandOptions = useMemo(
    () => [
      { label: "Probi", value: "1" },
      { label: "Yakult", value: "2" },
      { label: "Betagen", value: "3" },
      { label: "TH Probiotics", value: "4" },
      { label: "Nuvi", value: "5" },
      { label: "Đang không dùng các sản phẩm sữa chua uống men sống", value: "99" },
    ],
    [],
  );

  const q3aFlavorUsageOptions = useMemo(
    () => [
      { label: "Vị Có đường", value: "vi-co-duong" },
      { label: "Vị Ít đường", value: "vi-it-duong" },
      { label: "Vị Không đường", value: "vi-khong-duong" },
      {
        label: "Vị trái cây",
        value: "vi-trai-cay",
      },
    ],
    [],
  );

  const q3bMostUsedFlavorOptions = useMemo(
    () => [
      { label: "Vị Có đường", value: "vi-co-duong" },
      { label: "Vị Ít đường", value: "vi-it-duong" },
      { label: "Vị Không đường", value: "vi-khong-duong" },
      {
        label: "Vị trái cây",
        value: "vi-trai-cay",
      },
    ],
    [],
  );

  // Memoize filtered options để tránh re-computation
  const filteredQ2Options = useMemo(
    () => q2FrequentBrandOptions.filter((option) => q1Brands.includes(option.value)),
    [q2FrequentBrandOptions, q1Brands],
  );

  const filteredQ3bOptions = useMemo(
    () => q3bMostUsedFlavorOptions.filter((option) => q3aFlavorUsage.includes(option.value)),
    [q3bMostUsedFlavorOptions, q3aFlavorUsage],
  );

  const setQ2FrequentBrand = useCallback(
    (value: string) => {
      formMethods.setValue("q2_frequent_brand", value);
    },
    [formMethods.setValue],
  );

  const setQ3aValue = useCallback(
    (value: string[]) => {
      formMethods.setValue("q3a_flavor_usage", value);
    },
    [formMethods.setValue],
  );

  const setQ3bValue = useCallback(
    (value: string) => {
      formMethods.setValue("q3b_most_used_flavor", value);
    },
    [formMethods.setValue],
  );

  // Callback handlers để cập nhật local state
  const handleQ1Change = useCallback(
    (value: string[]) => {
      setQ1Brands(value);

      // Clear Q3a và Q3b nếu không sử dụng SCU MS
      const isUsingSCUMS = !value.includes("99") && value.length > 0;
      if (!isUsingSCUMS) {
        setQ2FrequentBrand("");
        setQ3aFlavorUsage([]);
        setQ3aValue([]);
        setQ3bValue("");
      }
    },
    [setQ3aValue, setQ3bValue, setQ2FrequentBrand],
  );

  const handleQ3aChange = useCallback((value: string[]) => {
    setQ3aFlavorUsage(value);
  }, []);

  // Tối ưu hóa callback để tránh cập nhật global state không cần thiết
  const handleToggleOption = useCallback(
    (optionValue: string, isChecked: boolean) => {
      const colorMappings: Record<string, [string, string]> = {
        "1": ["#050ba9", "#47c9fa"], // Probi
        "2": ["#ff0000", "#ff8372"], // Yakult
        "3": ["#e60041", "#ff8daa"], // Betagen
        "4": ["#013e73", "#72c5ed"], // TH Probiotics
        "5": ["#046f43", "#a6ffc1"], // Nuvi
        "99": ["#4d4d4d", "#c7c7c7"], // Không dùng
      };

      const newColors = colorMappings[optionValue];
      if (newColors) {
        globalContext.setState({ caroColors: newColors });
      }
    },
    [globalContext],
  );

  const saveNoGamesDataToFirebase = async (questionData: QuestionsSchema) => {
    try {
      // Lấy tất cả dữ liệu từ localStorage
      const infoData = localStorage.getItem("surveyInfo");
      const gamesData = localStorage.getItem("surveyGames");
      const imageFileData = localStorage.getItem("surveyImageFile");
      const otpData = localStorage.getItem("surveyOTP");

      if (!infoData) {
        throw new Error("Không tìm thấy thông tin cá nhân");
      }

      const info = JSON.parse(infoData);
      const games = gamesData ? JSON.parse(gamesData) : { games: [] };

      const firebaseData: any = {
        // Thông tin cá nhân - Convert codes thành labels
        name: info.fullName,
        phoneNumber: info.phoneNumber,
        extra: {
          address: info.address,
          gender: getGenderLabel(info.tt3_gender),
          birthYear: info.tt4_birth_year,
          maritalStatus: getMaritalStatusLabel(info.tt5_marital_status),
          childrenCount: info.tt6_children_count ? info.tt6_children_count : 0,
        },
        // Dữ liệu khảo sát - Convert codes thành labels
        surveyReport: {
          surveyMode: surveyMode,
          completedAt: new Date() as any,
          brands: (questionData.q1_brands || []).map((code: string) => getBrandLabel(code)),
          frequentBrand: (questionData.q1_brands || []).map((code: string) => getBrandLabel(code)),
          mostFrequentBrand: questionData.q2_frequent_brand
            ? getBrandLabel(questionData.q2_frequent_brand)
            : "",
          flavorUsage: (questionData.q3a_flavor_usage || []).map((code: string) =>
            getFlavorLabel(code),
          ),
          mostUsedFlavor: questionData.q3b_most_used_flavor
            ? getFlavorLabel(questionData.q3b_most_used_flavor)
            : "",
        },
      };

      if (otpData) {
        firebaseData.otp = otpData;
      }

      if (imageFileData) {
        firebaseData.image = imageFileData;
      }

      await mutationSurveySave.mutateAsync(firebaseData);

      console.log("No-games data saved to Firebase successfully");
    } catch (error) {
      console.error("Error saving no-games data to Firebase:", error);
      // Không throw error để không block navigation
      throw error;
    }
  };

  const handleFormSubmit: SubmitHandler<QuestionsSchema> = async (data) => {
    globalContext.setState({ caroColors: ["#050ba9", "#47c9fa"] });

    try {
      setLoading(true);

      // Lưu dữ liệu khảo sát
      const existingInfo = localStorage.getItem("surveyInfo");
      const existingImage = localStorage.getItem("surveyImageFile");
      const surveyData = {
        info: existingInfo ? JSON.parse(existingInfo) : null,
        image: existingImage,
        survey: data,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem("completeSurveyData", JSON.stringify(surveyData));

      // Đánh dấu step questions đã hoàn thành
      markStepComplete("questions");
      // Routing logic dựa trên survey flow
      if (surveyFlow === "no-games" || surveyMode === "qr") {
        // No-games flow: lưu Firebase trước khi đi đến complete
        await saveNoGamesDataToFirebase(data);
        setTimeout(() => {
          setCurrentStep("complete");
          setLoading(false);
        }, 1000);
      } else {
        // Full flow: đi đến lucky wheel
        setTimeout(() => {
          setCurrentStep("lucky-wheel");
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving questions data to Firebase:", error);
      setLoading(false);
    }
  };

  const handleFormOnInvalid: SubmitErrorHandler<QuestionsSchema> = (error) => {};

  // Check if this is a no-games flow (đến từ games page với hasPlayedGames: false)
  useEffect(() => {
    const gamesData = localStorage.getItem("surveyGames");
    if (gamesData) {
      try {
        const parsedGamesData = JSON.parse(gamesData);
        if (parsedGamesData.hasPlayedGames === false && !surveyFlow) {
          // Set no-games flow
          setSurveyFlow("no-games");
        }
      } catch (error) {
        console.error("Error parsing games data:", error);
      }
    }
  }, [setSurveyFlow, surveyFlow]);

  // Auto-set Q3b if Q3a has only 1 selection
  useEffect(() => {
    if (isUsingSCUMS) {
      if (q3aFlavorUsage.length === 1) {
        setQ3bValue(q3aFlavorUsage[0]);
      } else if (q3aFlavorUsage.length === 0) {
        setQ3bValue("");
      }
    }
  }, [q3aFlavorUsage, isUsingSCUMS, setQ3bValue]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <LoadingOverlay active={loading || mutationSurveySave.isLoading} />
      <div className="inset-0 mx-auto flex h-dvh max-w-3xl flex-col items-center justify-start space-y-8 px-4 pb-16 pt-6">

        <div className="relative z-[2]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center font-vnm-sans-display leading-none text-white"
            style={{
              fontSize: cssClamp(30, 40, 250, 500),
            }}
          >
            Probi muốn nghe một chút ý kiến của bạn
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="h-fit w-full pb-16"
        >
          {/* Questions */}
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
              {/* Q1: P1M - Brand Usage */}
              <div className="space-y-4">
                <p
                  className="text-center font-vnm-sans-display leading-none text-white"
                  style={{
                    fontSize: cssClamp(24, 28, 250, 500),
                  }}
                >
                  Trong 1 tháng qua, bạn và gia đình bạn đang dùng những nhãn hiệu sữa chua uống men
                  sống nào?
                </p>
                <Controller
                  control={formMethods.control}
                  name="q1_brands"
                  render={({ field }) => (
                    <CheckboxGroupInput
                      options={q1BrandsOptions}
                      multiple={true}
                      grid={1}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        handleQ1Change(value);
                      }}
                      error={!!formMethods.formState.errors.q1_brands}
                      onToggleOption={handleToggleOption}
                    />
                  )}
                />
                <FormErrorMessage name="q1_brands" errors={formMethods.formState.errors} />
              </div>

              {/* Q2: BUMO - Most Frequent Brand (Conditional) */}
              {shouldShowQ2 && (
                <>
                  <div className="h-[1px] w-full bg-white/50" />

                  <div className="space-y-4">
                    <p
                      className="text-center font-vnm-sans-display leading-none text-white"
                      style={{
                        fontSize: cssClamp(24, 28, 250, 500),
                      }}
                    >
                      Nhãn hiệu sữa chua uống men sống nào bạn và gia đình dùng thường xuyên nhất
                      trong 1 tháng qua?
                    </p>
                    <Controller
                      control={formMethods.control}
                      name="q2_frequent_brand"
                      render={({ field }) => (
                        <CheckboxGroupInput
                          options={filteredQ2Options}
                          multiple={false}
                          grid={2}
                          value={field.value}
                          onChange={field.onChange}
                          error={!!formMethods.formState.errors.q2_frequent_brand}
                        />
                      )}
                    />
                    <FormErrorMessage
                      name="q2_frequent_brand"
                      errors={formMethods.formState.errors}
                    />
                  </div>
                </>
              )}

              {/* Q3a: Flavor Usage (Only show if using SCU MS) */}
              {isUsingSCUMS && (
                <>
                  <div className="h-[1px] w-full bg-white/50" />
                  <div className="space-y-4">
                    <p
                      className="text-center font-vnm-sans-display leading-none text-white"
                      style={{
                        fontSize: cssClamp(24, 28, 250, 500),
                      }}
                    >
                      Bạn và gia đình đang dùng Sữa chua uống vị gì?
                    </p>
                    <Controller
                      control={formMethods.control}
                      name="q3a_flavor_usage"
                      render={({ field }) => (
                        <CheckboxGroupInput
                          options={q3aFlavorUsageOptions}
                          multiple={true}
                          grid={1}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            handleQ3aChange(value);
                          }}
                          error={!!formMethods.formState.errors.q3a_flavor_usage}
                        />
                      )}
                    />
                    <FormErrorMessage
                      name="q3a_flavor_usage"
                      errors={formMethods.formState.errors}
                    />
                  </div>
                </>
              )}

              {/* Q3b: Most Used Flavor (Conditional) */}
              {shouldShowQ3b && (
                <>
                  <div className="h-[1px] w-full bg-white/50" />
                  <div className="space-y-4">
                    <p
                      className="text-center font-vnm-sans-display leading-none text-white"
                      style={{
                        fontSize: cssClamp(24, 28, 250, 500),
                      }}
                    >
                      Bạn và gia đình dùng hương vị nào thường xuyên nhất?
                    </p>
                    <Controller
                      control={formMethods.control}
                      name="q3b_most_used_flavor"
                      render={({ field }) => (
                        <CheckboxGroupInput
                          options={filteredQ3bOptions}
                          multiple={false}
                          grid={1}
                          value={field.value}
                          onChange={field.onChange}
                          error={!!formMethods.formState.errors.q3b_most_used_flavor}
                        />
                      )}
                    />
                    <FormErrorMessage
                      name="q3b_most_used_flavor"
                      errors={formMethods.formState.errors}
                    />
                  </div>
                </>
              )}

              <div className="h-[1px] w-full bg-white/50" />

              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className={cn(
                    "rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 enabled:hover:bg-blue-500 enabled:hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{ fontSize: cssClamp(24, 36, 250, 500) }}
                  disabled={loading || mutationSurveySave.isLoading}
                >
                  Hoàn thành
                </button>
              </div>
            </form>
          </CaroBorder>
        </motion.div>
      </div>
    </>
  );
};
