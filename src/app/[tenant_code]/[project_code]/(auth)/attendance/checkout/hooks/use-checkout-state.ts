import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useProjectConfigs } from "@/hooks/project/use-project-configs";
import { useCheckoutGeolocation } from "./use-checkout-geolocation";
import { useCheckoutPhotoUpload } from "./use-checkout-photo-upload";
import { useCheckoutSubmit } from "./use-checkout-submit";
import { useCheckoutNotifications } from "./use-checkout-notifications";
import { getCheckoutLocation } from "../common/utils";
import type { CheckoutStep } from "../common/types";

/**
 * Main hook to manage all check-out state and logic
 */
export const useCheckoutState = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const selectedLocation = globalStore.use.selectedLocation();
  const {
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    isLoading: isLoadingConfigs,
  } = useProjectConfigs();

  // Determine initial step based on config
  const initialStep = React.useMemo<CheckoutStep>(() => {
    // If GPS is required, start with GPS
    if (projectCheckinFlow?.require_gps_verification) {
      return "gps";
    }
    // If attendance is required, start with capture
    if (projectCheckinFlow?.require_photo_verification) {
      return "capture";
    }
    // Otherwise, go directly to submit
    return "submit";
  }, [projectCheckinFlow, projectAttendancePhotoConfig]);

  // State for steps
  const [currentStep, setCurrentStep] = React.useState<CheckoutStep>(initialStep);
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [allbeDone, setAllbeDone] = React.useState(false);
  const hasAutoSubmittedRef = React.useRef(false);

  // Update step when config changes
  React.useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // Geolocation hook
  const {
    location,
    error: geolocationError,
    isLocalizing,
    userGeolocation,
    confirmLocation,
  } = useCheckoutGeolocation({
    currentStep,
  });

  // Memoized checkout location
  const checkoutLocation = React.useMemo(() => {
    return getCheckoutLocation(userGeolocation, currentAttendance);
  }, [userGeolocation, currentAttendance]);

  // Checkout submit hook
  const {
    submitCheckout,
    isLoading: isSubmitting,
  } = useCheckoutSubmit({
    attendance: currentAttendance,
    checkoutLocation,
    onSuccess: () => {
      setCurrentTipIndex(1);
      setAllbeDone(true);
    },
  });

  // Notifications hook
  const {
    showRangeWarning,
    hideRangeWarning,
    updateGpsError,
    removeCaptureNotification,
  } = useCheckoutNotifications({
    currentStep,
    photoConfig: projectAttendancePhotoConfig,
    isLocalizing,
    hasLocation: !!location,
    gpsConfig: projectGpsConfig,
  });

  // Update error handler to use updateGpsError
  React.useEffect(() => {
    if (geolocationError) {
      const errorMessage = geolocationError.message || "Không thể xác định vị trí";
      updateGpsError(errorMessage);
    }
  }, [geolocationError, updateGpsError]);

  // Photo upload hook
  const {
    isUploadingPhoto,
    photoUrl,
    uploadPhoto,
  } = useCheckoutPhotoUpload({
    user,
    attendanceId: currentAttendance?.id || 0,
    onUploadSuccess: (photoUrl) => {
      setCurrentStep("submit");
      submitCheckout(photoUrl);
    },
  });

  // Handle GPS update
  const handleOnUpdateGps = React.useCallback(
    (e: { isUserInLocationScope: boolean | undefined }) => {
      if (isLocalizing || geolocationError) return;

      if (e.isUserInLocationScope) {
        hideRangeWarning();
      } else if (e.isUserInLocationScope === false) {
        showRangeWarning();
      }
    },
    [isLocalizing, geolocationError, showRangeWarning, hideRangeWarning],
  );

  // Handle GPS confirmation
  const handleConfirmLocalize = React.useCallback(() => {
    confirmLocation();
    // Move to capture if attendance is required, otherwise go to submit
    if (projectCheckinFlow?.require_photo_verification) {
      setCurrentStep("capture");
    } else {
      setCurrentStep("submit");
    }
  }, [confirmLocation, projectCheckinFlow, projectAttendancePhotoConfig]);

  // Handle photo capture
  const handleOnCapture = React.useCallback(() => {
    removeCaptureNotification();
  }, [removeCaptureNotification]);

  const handleConfirmCapture = React.useCallback(
    async (file: File) => {
      await uploadPhoto(file);
    },
    [uploadPhoto],
  );

  const handleOnCameraError = React.useCallback(() => {
    removeCaptureNotification();
  }, [removeCaptureNotification]);

  // Reset auto-submit flag when leaving submit step
  React.useEffect(() => {
    if (currentStep !== "submit") {
      hasAutoSubmittedRef.current = false;
    }
  }, [currentStep]);

  // Auto-submit when reaching submit step if photo is not required or not in flow
  React.useEffect(() => {
    if (
      currentStep === "submit" &&
      !isUploadingPhoto &&
      !hasAutoSubmittedRef.current &&
      !isSubmitting
    ) {
      // Check if photo is required
      const isPhotoRequired =
        projectCheckinFlow?.require_photo_verification;

      // If photo is not required or not in flow, and no photo was captured, auto-submit
      if (!isPhotoRequired && !photoUrl) {
        hasAutoSubmittedRef.current = true;
        // Submit without photo
        submitCheckout();
      }
    }
  }, [
    currentStep,
    projectCheckinFlow?.require_photo_verification,
    projectAttendancePhotoConfig?.mode,
    photoUrl,
    isUploadingPhoto,
    isSubmitting,
    submitCheckout,
  ]);

  return {
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
    location,
    userGeolocation,
    isUploadingPhoto,
    photoUrl,
    currentTipIndex,
    allbeDone,
    isSubmitting,

    // Handlers
    handleOnUpdateGps,
    handleConfirmLocalize,
    handleOnCapture,
    handleConfirmCapture,
    handleOnCameraError,
    submitCheckout,
  };
};
