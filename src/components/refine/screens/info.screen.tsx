// @ts-nocheck

import { motion } from "framer-motion";
import CaroBorder from "../caro-border";
import { cssClamp } from "@/kits/utils";
import { TextInput } from "../text-input";
import { SelectDrawer } from "../select-drawer";
import { FormErrorMessage } from "../form-error-message";
import z from "zod";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { requiresCameraStep, requiresOTPStep } from "@/config/survey-flow.config";
import { useSurveyProgressContext } from "@/contexts/survey-progress.context";
import { Svgs } from "../svgs";
import { useMutationCustomerFindByPhoneNumber } from "@/services/api/customer/find-by-phone-numer";
import { Dialog } from "@/kits/components/Dialog";

interface InfoScreenProps {}

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const infoSchema = z
  .object({
    fullName: z.string().min(1, { message: "Họ tên không được để trống" }),
    phoneNumber: z
      .string()
      .min(1, { message: "Số điện thoại không được để trống" })
      .regex(phoneRegex, { message: "Số điện thoại không hợp lệ" }),
    address: z.string().min(1, { message: "Địa chỉ không được để trống" }),
    tt3_gender: z.string().min(1, { message: "Vui lòng chọn câu trả lời" }),
    tt4_birth_year: z
      .number({ required_error: "Vui lòng nhập năm sinh" })
      .min(1, { message: "Vui lòng nhập năm sinh" })
      .min(1900, { message: "Năm sinh không hợp lệ" })
      .max(2025, { message: "Năm sinh không hợp lệ" }),
    tt5_marital_status: z.string().min(1, { message: "Vui lòng chọn câu trả lời" }),
    tt6_children_count: z
      .number()
      .min(1, { message: "Vui lòng nhập số lượng bé" })
      .max(20, { message: "Số lượng bé không hợp lệ" })
      .optional(),
    authorizeMethod: z.enum(["OTP", "Non-Authorize"], {
      message: "Vui lòng chọn phương thức xác thực",
    }),
  })
  .superRefine((data, ctx) => {
    // TT6 is required when TT5 is "2" (Đã lập gia đình và có con)
    if (data.tt5_marital_status === "2") {
      if (!data.tt6_children_count) {
        ctx.addIssue({
          path: ["tt6_children_count"],
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập số lượng bé",
        });
      }
    }
  });

type InfoSchema = z.infer<typeof infoSchema>;

export const InfoScreen = (props: InfoScreenProps) => {
  const {} = props;

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [nextStep, setNextStep] = useState("otp");
  const surveyProgress = useSurveyProgressContext();
  const [isPhoneUsed, setIsPhoneUsed] = useState(false);

  const findByPhoneNumber = useMutationCustomerFindByPhoneNumber({
    config: {
      onError: (error: any) => {
        console.error("Error checking phone number:", error);
      },
    },
  });
  const markStepComplete = surveyProgress.use.markStepComplete();
  const setCurrentStep = surveyProgress.use.setCurrentStep();
  const surveyMode = surveyProgress.use.surveyMode();

  const formMethods = useForm<InfoSchema>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      tt3_gender: "",
      tt4_birth_year: undefined,
      tt5_marital_status: "",
      tt6_children_count: undefined,
      authorizeMethod: "Non-Authorize",
    },
  });

  const watchTT5 = formMethods.watch("tt5_marital_status");
  const shouldShowTT6 = watchTT5 === "2";

  const handleFormOnValid: SubmitHandler<InfoSchema> = async (data) => {
    try {
   
      // Save form data to localStorage or state management
      localStorage.setItem("surveyInfo", JSON.stringify(data));

      // Đánh dấu step info đã hoàn thành
      markStepComplete("info");

      setCurrentStep(nextStep as SurveyStep);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleFormOnInvalid: SubmitErrorHandler<InfoSchema> = (error) => {};

  // Clear TT6 if TT5 changes and doesn't require children count
  useEffect(() => {
    if (!shouldShowTT6) {
      formMethods.setValue("tt6_children_count", undefined);
    }
  }, [shouldShowTT6, formMethods]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const watchPhoneNumber = formMethods.watch("phoneNumber");
  useEffect(() => {
    const checkCustomer = async () => {
      if (watchPhoneNumber?.length === 10 && phoneRegex.test(watchPhoneNumber)) {
        
        try {
          const result = await findByPhoneNumber.mutateAsync(watchPhoneNumber);
           if (result.data.isSurveyReported) {
             setDialogMessage("Số điện thoại này đã được sử dụng để thực hiện khảo sát. Vui lòng sử dụng số điện thoại khác.");
             setShowDialog(true);
             setIsPhoneUsed(true);
             return;
           }
           setIsPhoneUsed(false);
          if (result.status === 200 && result.data && result.data.phoneNumber) {
            formMethods.setValue("fullName", result.data.name);
            setNextStep("questions");
          }
          else {
            formMethods.setValue("fullName", "");
            setNextStep("otp");
          }
        } catch (error) {
          console.error("Error checking customer:", error);
        }
      }
    };

    checkCustomer();
  }, [watchPhoneNumber]);

  return (
    <div className="flex h-full flex-col items-center justify-start space-y-8 px-4 pb-16 pt-6">
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
            onSubmit={formMethods.handleSubmit(handleFormOnValid, handleFormOnInvalid)}
          >
            <div className="space-y-4">
            <div>
              <Controller
                  control={formMethods.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <TextInput
                      placeholder="Số điện thoại"
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
              
              <div>
                <Controller
                  control={formMethods.control}
                  name="fullName"
                  render={({ field }) => (
                    <TextInput
                      placeholder="Họ và tên"
                      {...field}
                      error={!!formMethods.formState.errors.fullName}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FormErrorMessage name="fullName" errors={formMethods.formState.errors} />
              </div>

              
              <div>
                <Controller
                  control={formMethods.control}
                  name="address"
                  render={({ field }) => (
                    <TextInput
                      placeholder="Địa chỉ"
                      {...field}
                      error={!!formMethods.formState.errors.address}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FormErrorMessage name="address" errors={formMethods.formState.errors} />
              </div>

              <div>
                <Controller
                  control={formMethods.control}
                  name="tt3_gender"
                  render={({ field }) => (
                    <SelectDrawer
                      placeholder="Chọn giới tính"
                      options={[
                        { label: "Nam", value: "1" },
                        { label: "Nữ", value: "2" },
                        { label: "Không muốn ghi nhận", value: "0" },
                      ]}
                      {...field}
                      error={!!formMethods.formState.errors.tt3_gender}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
                <FormErrorMessage name="tt3_gender" errors={formMethods.formState.errors} />
              </div>

              <div>
                <Controller
                  control={formMethods.control}
                  name="tt4_birth_year"
                  render={({ field }) => (
                    <TextInput
                      placeholder="Năm sinh"
                      {...field}
                      error={!!formMethods.formState.errors.tt4_birth_year}
                      value={field.value?.toString()}
                      onChange={(value) => field.onChange(Number(value))}
                      type="number"
                    />
                  )}
                />
                <FormErrorMessage name="tt4_birth_year" errors={formMethods.formState.errors} />
              </div>

              <div>
                <Controller
                  control={formMethods.control}
                  name="tt5_marital_status"
                  render={({ field }) => (
                    <SelectDrawer
                      placeholder="Chọn tình trạng hôn nhân"
                      options={[
                        { label: "Chưa lập gia đình", value: "1" },
                        { label: "Đã lập gia đình và có con", value: "2" },
                        { label: "Đã lập gia đình và chưa có con", value: "3" },
                      ]}
                      {...field}
                      error={!!formMethods.formState.errors.tt5_marital_status}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
                <FormErrorMessage name="tt5_marital_status" errors={formMethods.formState.errors} />
              </div>

              {/* TT6: Children Count (Conditional) */}
              {shouldShowTT6 && (
                <>
                  <div>
                    <Controller
                      control={formMethods.control}
                      name="tt6_children_count"
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          type="number"
                          placeholder="Nhập số lượng bé"
                          error={!!formMethods.formState.errors.tt6_children_count}
                          value={field.value?.toString()}
                          onChange={(value) => field.onChange(Number(value))}
                        />
                      )}
                    />
                    <FormErrorMessage
                      name="tt6_children_count"
                      errors={formMethods.formState.errors}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={isPhoneUsed}
                className={`rounded-full bg-white px-16 py-3 font-vnm-sans-display uppercase leading-none text-blue-600 transition-all duration-200 ${!isPhoneUsed ? 'hover:bg-blue-500 hover:text-white' : 'opacity-50 cursor-not-allowed'}`}
                style={{ fontSize: cssClamp(24, 36, 250, 500) }}
              >
                Tiếp tục
              </button>
            </div>
          </form>
        </CaroBorder>
      </motion.div>
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Lỗi"
        description={dialogMessage}
        children={<></>}
      />
    </div>
  );
};
