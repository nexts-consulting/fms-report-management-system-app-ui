"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth.context";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { useCheckinState } from "../hooks/use-checkin-state";
import { CheckinHeader } from "./CheckinHeader";
import { CheckinGpsStep } from "./CheckinGpsStep";
import { CheckinCaptureStep } from "./CheckinCaptureStep";
import { CheckinSubmitStep } from "./CheckinSubmitStep";
import { CheckinSurveyStep } from "./CheckinSurveyStep";

/**
 * Main entry component for check-in process
 * Orchestrates all check-in steps and manages the flow
 */
export const Entry = () => {
  const router = useRouter();
  const { buildPath } = useTenantProjectPath();
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const {
    // Config
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    isLoadingConfigs,
    selectedWorkingShift,
    selectedLocation,

    // Flow
    currentStep,
    goToPreviousStep,

    // State
    isLocalizing,
    userGeolocation,
    isUploadingPhoto,
    currentTipIndex,
    allbeDone,
    isSubmitting,

    // Handlers
    handleOnUpdateGps,
    handleConfirmLocalize,
    handleOnCapture,
    handleConfirmCapture,
    handleOnCameraError,
    handleSurveyComplete,
  } = useCheckinState();

  // Redirect if no working shift selected
  React.useEffect(() => {
    if (!selectedWorkingShift) {
      router.replace(buildPath("/shift"));
    }
  }, [selectedWorkingShift, router, buildPath]);

  // Wait for configs to load
  if (isLoadingConfigs || !selectedWorkingShift) {
    return <></>;
  }

  return (
    <>
      <LoadingOverlay active={allbeDone || isUploadingPhoto} />

      <div className="flex min-h-dvh flex-col">
        <CheckinHeader
          currentStep={currentStep}
          isLocalizing={isLocalizing}
          onBack={goToPreviousStep}
        />

        {currentStep === "gps" && projectCheckinFlow?.require_gps_verification && (
          <CheckinGpsStep
            user={user}
            location={selectedLocation}
            userLocation={userGeolocation}
            workingShift={selectedWorkingShift}
            gpsConfig={projectGpsConfig}
            onUpdateGps={handleOnUpdateGps}
            onContinue={handleConfirmLocalize}
          />
        )}

        {currentStep === "capture" &&
          projectCheckinFlow?.require_photo_verification &&
          (
            <CheckinCaptureStep
              onConfirm={handleConfirmCapture}
              onCapture={handleOnCapture}
              onError={handleOnCameraError}
            />
          )}

        {currentStep === "survey" && projectCheckinFlow?.require_survey && (
          <CheckinSurveyStep
            onComplete={handleSurveyComplete}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === "submit" && (
          <CheckinSubmitStep
            workingShift={selectedWorkingShift}
            currentTipIndex={currentTipIndex}
            isSubmitting={isSubmitting}
            isUploadingPhoto={isUploadingPhoto}
          />
        )}
      </div>
    </>
  );
};
