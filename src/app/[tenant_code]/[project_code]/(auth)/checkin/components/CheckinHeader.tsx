import React from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { CheckinStep } from "../common/types";

interface CheckinHeaderProps {
  currentStep: CheckinStep;
  isLocalizing?: boolean;
  onBack: () => void;
}

/**
 * Header component for check-in steps
 * Shows header for GPS and Capture steps, hides for other steps
 */
export const CheckinHeader: React.FC<CheckinHeaderProps> = ({
  currentStep,
  isLocalizing = false,
  onBack,
}) => {
  const stepsWithoutHeader: CheckinStep[] = [
    "submit",
    "survey",
    "pre_shift_task",
    "post_shift_task",
  ];
  const shouldShowHeader = !stepsWithoutHeader.includes(currentStep);

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <ScreenHeader
      title="Check in"
      loading={isLocalizing}
      onBack={onBack}
      containerClassName="mb-0"
    />
  );
};
