import { cssClamp } from "@/kits/utils/common.util";
import { motion } from "framer-motion";
import { Svgs } from "../svgs";
import { Icons } from "@/kits/components/Icons";
import { useEffect, useState } from "react";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "../text-input";
import { FormErrorMessage } from "../form-error-message";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutationCustomerFindByPhoneNumber } from "@/services/api/customer/find-by-phone-numer";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: "Số điện thoại không được để trống" })
    .regex(phoneRegex, { message: "Số điện thoại không hợp lệ" }),
});

type FormSchema = z.infer<typeof formSchema>;

export const GiftCheckPhoneScreen = () => {
  const surveyProgress = useSurveyProgressContext();
  const markStepComplete = surveyProgress.use.markStepComplete();
  const resetProgress = surveyProgress.use.resetProgress();
  const surveyFlow = surveyProgress.use.surveyFlow();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();

  const formMethods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const customerFindByPhoneNumberMutation = useMutationCustomerFindByPhoneNumber({
    config: {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFormOnValid: SubmitHandler<FormSchema> = async (data) => {
    try {
      await customerFindByPhoneNumberMutation.mutateAsync(data.phoneNumber);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormOnInvalid: SubmitErrorHandler<FormSchema> = (error) => {
    console.log(error);
  };

  const handleOnContinue = () => {
    localStorage.setItem("giftInfo", JSON.stringify(customerFindByPhoneNumberMutation.data?.data));
    setCurrentStep("gift-games");
  };

  return (
    <>
      <LoadingOverlay active={customerFindByPhoneNumberMutation.isLoading} />

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

        {/* Nội dung chính */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex w-full flex-1 flex-col items-center justify-start px-2 pb-16"
        >
          {/* Success illustration */}
          <div className="mb-6 w-full bg-black/40 p-4 backdrop-blur-sm">
            <p className="mb-2 text-left text-base font-medium text-white">
              Số điện thoại khách hàng
            </p>
            <form
              className="space-y-4 py-4"
              onSubmit={formMethods.handleSubmit(handleFormOnValid, handleFormOnInvalid)}
            >
              <div>
                <Controller
                  control={formMethods.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <TextInput
                      placeholder="Nhập số điện thoại"
                      {...field}
                      error={!!formMethods.formState.errors.phoneNumber}
                      value={field.value}
                      onChange={field.onChange}
                      type="tel"
                    />
                  )}
                />
                <FormErrorMessage name="phoneNumber" errors={formMethods.formState.errors} />
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className="rounded-full bg-white px-12 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
                  style={{ fontSize: cssClamp(20, 28, 250, 500) }}
                >
                  Kiểm tra
                </button>
              </div>
            </form>
          </div>

          {customerFindByPhoneNumberMutation.data?.data ? (
            customerFindByPhoneNumberMutation.data.data.isSurveyReported === true ? (
              customerFindByPhoneNumberMutation.data.data.isReceivedSurveyGift === false ? (
                // Trường hợp 1: Đã làm khảo sát và chưa nhận quà
                <>
                  <div className="mb-3 w-full bg-black/40 p-4 text-left backdrop-blur-sm">
                    <p className="mb-2 font-semibold text-white">Thông tin đã đăng ký:</p>
                    <div className="space-y-1 text-sm text-white/90">
                      <div className="inline-flex justify-between gap-2">
                        <p className="grow">
                          <strong>Tên:</strong>{" "}
                          <span className="text-[#e7f9a1]">
                            {customerFindByPhoneNumberMutation.data.data.name}
                          </span>
                        </p>
                        <p className="grow">
                          <strong>Số điện thoại:</strong>{" "}
                          <span className="text-[#e7f9a1]">
                            {customerFindByPhoneNumberMutation.data.data.phoneNumber}
                          </span>
                        </p>
                      </div>
                      <p className="grow">
                        <strong>Hoàn thành: </strong>
                        <span className="text-[#e7f9a1]">{new Date().toLocaleString("vi-VN")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 bg-black/40 p-4 backdrop-blur-sm">
                    <p className="mb-2 font-semibold text-white">Chúc mừng bạn đã hoàn thành khảo sát!</p>
                    <p className="text-sm text-white/90">
                      Còn một bước cuối cùng để có thể nhận được
                      01 vòng quay may mắn
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleOnContinue}
                      className="rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 hover:bg-blue-500 hover:text-white"
                      style={{ fontSize: cssClamp(24, 36, 250, 500) }}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </>
              ) : (
                // Trường hợp 2: Đã làm khảo sát và đã nhận quà
                <div className="mb-3 w-full bg-black/40 p-4 text-left backdrop-blur-sm">
                  <p className="mb-2 font-semibold text-white">Bạn đã thực hiện đổi quà thành công!</p>
                  <div className="space-y-1 text-sm text-white/90">
                    <p className="grow">
                      <strong>Quà đã nhận: </strong>{" "}
                      <span className="text-[#e7f9a1]">{customerFindByPhoneNumberMutation.data.data.receivedGift}</span>  
                    </p>
                    <p className="grow">
                      <strong>Thời gian nhận quà: </strong>{" "}    
                      <span className="text-[#e7f9a1]">{customerFindByPhoneNumberMutation.data.data.giftReceivedAt ? new Date(customerFindByPhoneNumberMutation.data.data.giftReceivedAt).toLocaleString("vi-VN") : "Không có thời gian nhận quà"}</span>
                    </p>
                  </div>
                </div>
              )
            ) : (
              // Trường hợp 3: Chưa làm khảo sát
              <div className="mb-3 w-full bg-black/40 p-4 text-left backdrop-blur-sm">
                <p className="mb-2 font-semibold text-white">Bạn chưa thực hiện khảo sát?</p>
                <div className="space-y-1 text-sm text-white/90">
                  <p>Liên hệ nhân viên hoặc quét mã QR sau để thực hiện</p>
                  <img src="/images/qrcode_vinamilk-probi.kayevent.vn.png" alt="QR Code" className="w-full h-auto" />
                </div>
              </div>
            )
          ) : null}
        </motion.div>
      </div>
    </>
  );
};
