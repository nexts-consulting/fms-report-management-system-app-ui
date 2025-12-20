import React from "react";
import { Survey } from "@/components/Survey";

interface CheckinSurveyStepProps {
  onComplete: () => void;
  onBack: () => void;
}

/**
 * Survey step component for check-in process
 */
export const CheckinSurveyStep: React.FC<CheckinSurveyStepProps> = ({
  onComplete,
  onBack,
}) => {
  return <Survey onComplete={onComplete} onBack={onBack} />;
};
