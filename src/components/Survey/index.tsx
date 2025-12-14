"use client";

import React from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/kits/components/Button";
import { TextInput } from "@/kits/components/TextInput";
import { CheckboxGroupInput } from "@/kits/components/CheckboxGroupInput";

interface SurveyProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const Survey = ({ onComplete, onBack }: SurveyProps) => {
  const [currentStep, setCurrentStep] = React.useState<"info" | "questions" | "complete">("info");

  // Form state
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [satisfaction, setSatisfaction] = React.useState<string>("");
  const [promotion, setPromotion] = React.useState<string>("");

  const handleNext = () => {
    if (currentStep === "info") {
      setCurrentStep("questions");
    } else if (currentStep === "questions") {
      setCurrentStep("complete");
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-10">
      <ScreenHeader title="Khảo sát" onBack={onBack} />

      <div className="flex flex-1 flex-col p-4">
        {currentStep === "info" && (
          <div className="mx-auto w-full max-w-md space-y-6 bg-white p-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-medium text-gray-100">Thông tin cá nhân</h2>
              <p className="text-sm text-gray-50">
                Vui lòng cung cấp thông tin cá nhân để hoàn tất khảo sát
              </p>
            </div>
            <div className="space-y-4">
              <TextInput
                type="text"
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextInput
                type="tel"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <TextInput
                type="text"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleNext} className="w-full" variant="primary">
              Tiếp theo
            </Button>
          </div>
        )}

        {currentStep === "questions" && (
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-medium text-gray-100">Câu hỏi khảo sát</h2>
              <p className="text-sm text-gray-50">
                Vui lòng trả lời các câu hỏi sau để chúng tôi có thể cải thiện dịch vụ
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4">
                <CheckboxGroupInput
                  label="Bạn có hài lòng với dịch vụ của chúng tôi không?"
                  options={[
                    { label: "Rất hài lòng", value: "very-satisfied" },
                    { label: "Hài lòng", value: "satisfied" },
                    { label: "Bình thường", value: "normal" },
                    { label: "Không hài lòng", value: "unsatisfied" },
                  ]}
                  value={satisfaction}
                  onChange={setSatisfaction}
                  multiple={false}
                  grid={1}
                />
              </div>
              <div className="bg-white p-4">
                <CheckboxGroupInput
                  label="Bạn có muốn nhận thông tin khuyến mãi không?"
                  options={[
                    { label: "Có", value: "yes" },
                    { label: "Không", value: "no" },
                  ]}
                  value={promotion}
                  onChange={setPromotion}
                  multiple={false}
                  grid={1}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setCurrentStep("info")} variant="tertiary" className="flex-1">
                Quay lại
              </Button>
              <Button onClick={handleNext} variant="primary" className="flex-1">
                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {currentStep === "complete" && (
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-10">
              <svg
                className="h-10 w-10 text-green-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-gray-100">Hoàn thành!</h2>
              <p className="text-sm text-gray-50">
                Cảm ơn bạn đã dành thời gian để hoàn thành khảo sát
              </p>
            </div>
            <Button onClick={handleComplete} variant="primary" className="w-full">
              Tiếp tục check-in
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
