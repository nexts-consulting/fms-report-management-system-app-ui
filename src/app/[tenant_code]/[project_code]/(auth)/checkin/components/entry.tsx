"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { useCheckinState } from "../hooks/use-checkin-state";
import { CheckinHeader } from "./CheckinHeader";
import { CheckinGpsStep } from "./CheckinGpsStep";
import { CheckinCaptureStep } from "./CheckinCaptureStep";
import { CheckinSubmitStep } from "./CheckinSubmitStep";
import { CheckinSurveyStep } from "./CheckinSurveyStep";
import { buildAttendancePhotoTimeMarkConfig } from "@/utils/attendance-photo-timemark.util";
import { getUserFullName } from "@/utils/auth";

/**
 * Main entry component for check-in process
 * Orchestrates all check-in steps and manages the flow
 */
export const Entry = () => {
  const router = useRouter();
  const { buildPath } = useTenantProjectPath();
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const isCheckingCurrentShift = globalStore.use.isCheckingCurrentShift();

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

  const checkinTimeMarkConfig = buildAttendancePhotoTimeMarkConfig({
    actionLabel: "Check in",
    shiftName: selectedWorkingShift?.name,
    employeeName: getUserFullName(user),
    locationName: selectedLocation?.name || selectedWorkingShift?.location?.name,
  });


  React.useEffect(() => {
    if (isCheckingCurrentShift) return;

    if (currentAttendance) {
      router.replace(buildPath("/attendance/tracking"));
      return;
    }

    if (!selectedWorkingShift) {
      router.replace(buildPath("/shift"));
    }
  }, [
    isCheckingCurrentShift,
    currentAttendance,
    selectedWorkingShift,
    router,
    buildPath,
  ]);

  // Wait for configs and current-shift check to finish before rendering the flow
  if (
    isLoadingConfigs ||
    isCheckingCurrentShift ||
    currentAttendance ||
    !selectedWorkingShift
  ) {
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
              timeMarkConfig={checkinTimeMarkConfig}
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
