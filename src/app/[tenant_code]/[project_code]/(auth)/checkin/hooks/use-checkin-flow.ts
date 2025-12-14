import React from "react";
import { useRouter } from "next/navigation";
import type { CheckinStep } from "../common/types";
import { calculateAvailableSteps } from "../common/utils";
import type { IProjectCheckinFlow } from "@/services/application/management/projects/configs/types";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

interface UseCheckinFlowOptions {
  checkinFlow: IProjectCheckinFlow | null | undefined;
}

export const useCheckinFlow = ({ checkinFlow }: UseCheckinFlowOptions) => {
  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  // Calculate available steps based on config
  const availableSteps = React.useMemo(() => calculateAvailableSteps(checkinFlow), [checkinFlow]);

  // Get current step index
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const currentStep = React.useMemo(
    () => availableSteps[currentStepIndex] ?? "gps",
    [availableSteps, currentStepIndex],
  );

  // Navigate to next step
  const goToNextStep = React.useCallback(() => {
    if (currentStepIndex < availableSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, availableSteps.length]);

  // Navigate to previous step
  const goToPreviousStep = React.useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      router.back();
    }
  }, [currentStepIndex, router]);

  // Handle step-specific navigation
  const goToStep = React.useCallback(
    (step: CheckinStep) => {
      const stepIndex = availableSteps.indexOf(step);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [availableSteps],
  );

  return {
    availableSteps,
    currentStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setCurrentStepIndex,
  };
};
