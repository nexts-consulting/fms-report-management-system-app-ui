import { cn, cssClamp } from "@/kits/utils";
import { motion } from "framer-motion";
import CaroBorder from "../caro-border";
import { CodeInput } from "../code-input";
import { z } from "zod";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { requiresCameraStep } from "@/config/survey-flow.config";
import { Svgs } from "../svgs";
import { useNotification } from "@/kits/components/Notification";
import { HttpStatusCode } from "axios";
import { redeemReportApi } from "@/services/api/reports/redeem-report";
import { generateOtp } from "@/utils/otp.util";
import { Dialog } from "@/kits/components/Dialog";

interface OtpScreenProps {}

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "Mã OTP phải có 6 ký tự")
    .max(6, "Mã OTP phải có 6 ký tự")
    .regex(/^\d{6}$/, "Mã OTP chỉ được chứa số"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export const OtpScreen = (props: OtpScreenProps) => {
  const DEFAULT_OTP = "000000";
  const MAX_OTP_TRIES = 3;
  const OTP_RETRY_TIME = 5;
  
  const {} = props;

  const [fakeLoading, setFakeLoading] = useState(false);

  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();
  const notification = useNotification();
  const infoData = localStorage.getItem("surveyInfo");
  const info = infoData ? JSON.parse(infoData) : null;

  const [otpCountdown, setOtpCountdown] = useState(OTP_RETRY_TIME);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [newOtp, setNewOtp] = useState("");
  const [otpTries, setOtpTries] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [isMaxOtpTries, setIsMaxOtpTries] = useState(false);

  const handleGenerateOtp = () => {
    const newOtpGenerated = generateOtp();
    setNewOtp(newOtpGenerated);
    console.log("Generated OTP:", newOtpGenerated);
    return newOtpGenerated;
  };
  const handleIncrementOtpTries = () => {
    setOtpTries((prev) => prev + 1);
  };
  
  const handleSendOtp = async () => {
    console.log("showDialog", showDialog);
    console.log("otpTries", otpTries);
    if (otpTries === MAX_OTP_TRIES) {
      setIsMaxOtpTries(true);
      setShowDialog(true);
      return;
    }
    try {
      // Gọi API gửi OTP
      handleIncrementOtpTries();
      // const response = await redeemReportApi.sendOtp({ phoneNumber: info?.phoneNumber, otp: handleGenerateOtp()});]
      const response = { status: HttpStatusCode.Ok };
      if (response.status === HttpStatusCode.Ok) {
        notification.info({
          title: "Gửi OTP thành công",
          description: `Mã OTP đã được gửi đến số ${info?.phoneNumber}`,
          options: {
            duration: 3000,
          },
        });
      } else {
        notification.error({
          title: "Không thể gửi mã OTP.",
          description: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại hoặc liên hệ IT",
          options: {
            duration: 3000,
          },
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      notification.error({
        title: "Có lỗi xảy ra khi gửi mã OTP.",
        description: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại hoặc liên hệ IT",
        options: {
          duration: 3000,
        },
      });
    } finally {
      setOtpCountdown(OTP_RETRY_TIME);
      setIsOTPSent(true);
    }
  };

  const formMethods = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleFormSubmit: SubmitHandler<OTPFormData> = async (data) => {
    try {
      setFakeLoading(true);
      localStorage.setItem("surveyOTP", data.otp);
      setTimeout(() => {
        markStepComplete("otp");
        setFakeLoading(false);

        if (surveyMode === "pg") {
          const nextStep = requiresCameraStep() ? "camera" : "games";
          setCurrentStep(nextStep);
        } else if (surveyMode === "qr") {
          const nextStep = "questions";
          setCurrentStep(nextStep);
        }
      }, 1000);
    } catch (error) {}
  };
  const watchOtp = formMethods.watch("otp");
  const isOtpValid = () => watchOtp === newOtp || watchOtp === DEFAULT_OTP;
  const isOtpComplete = () => watchOtp.length === 6;

  useEffect(() => {
    if (!isOTPSent) {
      handleSendOtp();
      setOtpCountdown(OTP_RETRY_TIME);
    }
  }, [isOTPSent]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpCountdown]);

  const handleFormOnInvalid: SubmitErrorHandler<OTPFormData> = (error) => {};

  const handleCameraStep = async () => {
    try {
      setCurrentStep("camera");
    } catch (error) {
      console.error("Error camera step:", error);
    }
  };


  return (
    <>
      <LoadingOverlay active={fakeLoading} />
      <div className="inset-0 flex h-dvh flex-col items-center justify-start space-y-8 overflow-auto px-4 pb-16 pt-6">
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
            Xác thực OTP
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
            Vui lòng nhập mã OTP để tiếp tục
          </motion.p>
        </div>


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="h-fit w-full"
        >
          <CaroBorder
            borderRows={2}
            squareSize={6}
            color1="#050ba9"
            color2="#FFFFFF"
            className="bg-[#050ba9]"
          >
            <form
              className="space-y-8 px-4 py-8"
              onSubmit={formMethods.handleSubmit(handleFormSubmit, handleFormOnInvalid)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Controller
                    control={formMethods.control}
                    name="otp"
                    render={({ field }) => (
                      <CodeInput
                        length={6}
                        type="number"
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear any previous errors
                          formMethods.clearErrors("otp");
                          
                          // Check if OTP is complete but invalid
                          if (e.length === 6 && e !== newOtp && e !== DEFAULT_OTP) {
                            formMethods.setError("otp", { message: "Mã OTP không chính xác" });
                          }
                        }}
                      />
                    )}
                  />
                </div>
                <div className="text-center">
                  {formMethods.formState.errors.otp && (
                    <p className="text-red-500 mb-2">{formMethods.formState.errors.otp.message}</p>
                  )}
                  <p 
                    className={cn(
                      "text-content-3 text-s text-center font-medium text-white",
                      isMaxOtpTries ? "opacity-50 cursor-not-allowed" : (otpCountdown === 0 && !isMaxOtpTries ? "cursor-pointer " : "")
                    )} 
                    onClick={() => {
                      if (otpCountdown === 0 && !isMaxOtpTries) {
                        handleSendOtp();
                      }
                    }}
                  >
                    {isMaxOtpTries 
                      ? "Đã vượt quá số lần gửi OTP" 
                      : (otpCountdown > 0 ? `Gửi lại mã OTP sau ${otpCountdown}s` : "Gửi lại mã OTP")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className={cn(
                    "rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 enabled:hover:bg-blue-500 enabled:hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{ fontSize: cssClamp(24, 36, 250, 500) }}
                  disabled={fakeLoading || !isOtpComplete() || !isOtpValid()}
                >
                  Xác thực
                </button>
              </div>


              <div className="flex items-center justify-center">
                
                <div className="flex flex-col items-center justify-center">
                <p className="text-content-3 text-s text-center font-medium text-white">
                  Bạn không nhận được mã OTP?
                </p>
                <p
                  className="text-content-3 text-s text-center font-medium text-white underline mt-1"
                  onClick={handleCameraStep}
                >
                  Chụp ảnh selfies
                </p>
              </div>

              </div>
            </form>
          </CaroBorder>
        </motion.div>
      </div>
       <Dialog
         isOpen={showDialog}
         onClose={() => setShowDialog(false)}
         title="Đã vượt quá số lần gửi OTP"
         description="Bạn đã vượt quá số lần gửi OTP. Hãy sử dụng chức năng chụp ảnh selfie để xác thực."
         children={<></>}
       />
    </>
  );
};
