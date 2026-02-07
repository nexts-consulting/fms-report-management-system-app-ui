"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth.context";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useCheckoutState } from "../hooks/use-checkout-state";
import { CheckoutHeader } from "./CheckoutHeader";
import { CheckoutGpsStep } from "./CheckoutGpsStep";
import { CheckoutCaptureStep } from "./CheckoutCaptureStep";
import { CheckoutSubmitStep } from "./CheckoutSubmitStep";

/**
 * Main entry component for check-out process
 * Orchestrates all check-out steps and manages the flow
 */
export const Entry = () => {
  const router = useRouter();
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const {
    // Config
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    isLoadingConfigs,
    currentAttendance,
    selectedLocation,
    // Flow
    currentStep,

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
  } = useCheckoutState();

  // Redirect if no attendance
  if (!currentAttendance) {
    return <></>;
  }

  // Wait for configs to load
  if (isLoadingConfigs) {
    return <></>;
  }

  return (
    <>
      <LoadingOverlay active={allbeDone || isUploadingPhoto} />

      <div className="flex min-h-dvh flex-col">
        <CheckoutHeader
          currentStep={currentStep}
          isLocalizing={isLocalizing}
          onBack={() => router.back()}
        />

        {currentStep === "gps" && projectCheckinFlow?.require_gps_verification && (
          <CheckoutGpsStep
            user={user}
            location={selectedLocation}
            userLocation={userGeolocation}
            attendance={currentAttendance}
            gpsConfig={projectGpsConfig}
            onUpdateGps={handleOnUpdateGps}
            onContinue={handleConfirmLocalize}
          />
        )}

        {currentStep === "capture" &&
          projectCheckinFlow?.require_photo_verification &&
          (
            <CheckoutCaptureStep
              onConfirm={handleConfirmCapture}
              onCapture={handleOnCapture}
              onError={handleOnCameraError}
            />
          )}

        {currentStep === "submit" && (
          <CheckoutSubmitStep
            location={selectedLocation}
            currentTipIndex={currentTipIndex}
            isSubmitting={isSubmitting}
            isUploadingPhoto={isUploadingPhoto}
          />
        )}
      </div>
    </>
  );
};
