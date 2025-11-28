import { cssClamp, cn } from "@/kits/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import CaroBorder from "../caro-border";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { Controller } from "react-hook-form";
import { ImageCaptureInput } from "@/kits/components/ImageCaptureInput";
import { FormErrorMessage } from "../form-error-message";
import { Svgs } from "../svgs";

interface CameraScreenProps {}

const cameraSchema = z.object({
  image: z.instanceof(File, { message: "Vui lòng chụp ảnh" }),
});

type CameraSchema = z.infer<typeof cameraSchema>;

export const CameraScreen = (props: CameraScreenProps) => {
  const {} = props;

  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();

  const [loading, setLoading] = useState(false);

  const formMethods = useForm<CameraSchema>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      image: undefined,
    },
  });

  const handleFormSubmit: SubmitHandler<CameraSchema> = async (data) => {
    try {
      setLoading(true);

      // Lưu ảnh vào localStorage (cả URL và file data)
      const imageUrl = URL.createObjectURL(data.image);
      localStorage.setItem("surveyImage", imageUrl);

      // Chuyển file thành base64 để lưu vào localStorage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        localStorage.setItem("surveyImageFile", base64);
      };
      reader.readAsDataURL(data.image);

      // Đánh dấu step camera đã hoàn thành
      markStepComplete("camera");

      setTimeout(() => {
        if (surveyMode === "pg") {
          setCurrentStep("games");
        } else if (surveyMode === "qr") {
          setCurrentStep("questions");
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
    } finally {
    }
  };

  const handleFormOnInvalid: SubmitErrorHandler<CameraSchema> = (error) => {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <LoadingOverlay active={loading} />
      <div className="inset-0 flex h-dvh flex-col items-center justify-start space-y-8 px-4 pb-16 pt-6">
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
            Kích hoạt danh tính
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
            Nhìn thẳng vào camera, cười thật tươi nhé!
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
              <div className="space-y-4">
                <Controller
                  control={formMethods.control}
                  name="image"
                  render={({ field }) => (
                    <ImageCaptureInput
                      helperText="Nhấn để mở camera và chụp ảnh"
                      defaultFacingMode="user"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!formMethods.formState.errors.image}
                    />
                  )}
                />
                <FormErrorMessage name="image" errors={formMethods.formState.errors} />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className={cn(
                    "rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 enabled:hover:bg-blue-500 enabled:hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{ fontSize: cssClamp(24, 36, 250, 500) }}
                  disabled={loading || !formMethods.watch("image")}
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
