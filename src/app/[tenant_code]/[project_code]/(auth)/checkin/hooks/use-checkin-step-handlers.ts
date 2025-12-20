import React from "react";
import { useRouter } from "next/navigation";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import type { CheckinStep } from "../common/types";
import type { IProjectCheckinFlow } from "@/types/model";

interface UseCheckinStepHandlersOptions {
  currentStep: CheckinStep;
  checkinFlow: IProjectCheckinFlow | null | undefined;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

/**
 * Hook to handle step-specific logic and side effects
 */
export const useCheckinStepHandlers = ({
  currentStep,
  checkinFlow,
  goToNextStep,
  goToPreviousStep,
}: UseCheckinStepHandlersOptions) => {
  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  // Handle survey completion - continue to next checkin step
  const handleSurveyComplete = React.useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // Handle pre-shift task step
  React.useEffect(() => {
    if (currentStep === "pre_shift_task" && checkinFlow?.require_pre_shift_task) {
      // TODO: Implement pre-shift task component
      // For now, skip to next step
      goToNextStep();
    }
  }, [currentStep, checkinFlow, goToNextStep]);

  // Handle post-shift task step
  React.useEffect(() => {
    if (currentStep === "post_shift_task" && checkinFlow?.require_post_shift_task) {
      // TODO: Implement post-shift task component
      // For now, redirect to tracking
      router.replace(buildPath("/attendance/tracking"));
    }
  }, [currentStep, checkinFlow, router, buildPath]);

  return {
    handleSurveyComplete,
  };
};
