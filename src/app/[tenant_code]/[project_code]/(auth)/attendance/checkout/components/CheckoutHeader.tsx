import React from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { CheckoutStep } from "../common/types";

interface CheckoutHeaderProps {
  currentStep: CheckoutStep;
  isLocalizing?: boolean;
  onBack: () => void;
}

/**
 * Header component for check-out steps
 * Shows header for GPS and Capture steps, hides for submit step
 */
export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  currentStep,
  isLocalizing = false,
  onBack,
}) => {
  if (currentStep === "submit") {
    return null;
  }

  return (
    <ScreenHeader
      title="Check out"
      loading={isLocalizing}
      onBack={onBack}
      containerClassName="mb-0"
    />
  );
};
