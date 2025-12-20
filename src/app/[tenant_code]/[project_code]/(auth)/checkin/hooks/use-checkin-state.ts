import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useProjectConfigs } from "@/hooks/project/use-project-configs";
import { useCheckinFlow } from "../../../../../../hooks/check-in/use-checkin-flow";
import { useCheckinSubmit } from "../../../../../../hooks/check-in/use-checkin-submit";
import { useCheckinNotifications } from "../../../../../../hooks/check-in/use-checkin-notifications";
import { useCheckinGeolocation } from "./use-checkin-geolocation";
import { useCheckinPhotoUpload } from "./use-checkin-photo-upload";
import { useCheckinStepHandlers } from "./use-checkin-step-handlers";
import { getCheckinLocation } from "../common/utils";
import type { UserGeolocation } from "../common/types";

/**
 * Main hook to manage all check-in state and logic
 */
export const useCheckinState = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const globalStore = useGlobalContext();
  const selectedWorkingShift = globalStore.use.selectedWorkingShift();
  const selectedLocation = globalStore.use.selectedLocation();
  const {
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    isLoading: isLoadingConfigs,
  } = useProjectConfigs();

  // Checkin flow hook
  const {
    availableSteps,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    setCurrentStepIndex,
  } = useCheckinFlow({
    checkinFlow: projectCheckinFlow,
  });

  // State for tips and completion
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [allbeDone, setAllbeDone] = React.useState(false);

  // Geolocation hook
  const {
    location,
    error: geolocationError,
    isLocalizing,
    userGeolocation,
    confirmLocation,
  } = useCheckinGeolocation({
    currentStep,
    onLocationUpdate: (location) => {
      // Location updated
    },
  });

  // Memoized checkin location
  const checkinLocation = React.useMemo(() => {
    if (!selectedWorkingShift) return null;
    return getCheckinLocation(
      projectCheckinFlow,
      projectGpsConfig,
      userGeolocation,
      selectedWorkingShift,
    );
  }, [projectCheckinFlow, projectGpsConfig, userGeolocation, selectedWorkingShift]);

  // Checkin submit hook
  const {
    submitCheckin,
    isLoading: isSubmitting,
  } = useCheckinSubmit({
    user,
    workingShiftLocation: selectedWorkingShift,
    checkinLocation,
    checkinFlow: projectCheckinFlow,
    availableSteps,
    onStepChange: setCurrentStepIndex,
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
  } = useCheckinNotifications({
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
  } = useCheckinPhotoUpload({
    user,
    onUploadSuccess: (photoUrl) => {
      goToNextStep();
      submitCheckin(photoUrl);
    },
  });

  // Step handlers hook
  const { handleSurveyComplete } = useCheckinStepHandlers({
    currentStep,
    checkinFlow: projectCheckinFlow,
    goToNextStep,
    goToPreviousStep,
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
    goToNextStep();
  }, [confirmLocation, goToNextStep]);

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

  // Auto-submit when reaching submit step if photo is not required and no file captured
  React.useEffect(() => {
    if (
      currentStep === "submit" &&
      projectAttendancePhotoConfig?.mode === "NOT_REQUIRED" &&
      !photoUrl &&
      !isUploadingPhoto
    ) {
      // Submit without photo
      submitCheckin();
    }
  }, [currentStep, projectAttendancePhotoConfig, photoUrl, isUploadingPhoto, submitCheckin]);

  return {
    // Config
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    isLoadingConfigs,
    selectedWorkingShift,
    selectedLocation,

    // Flow
    availableSteps,
    currentStep,
    goToNextStep,
    goToPreviousStep,

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
    handleSurveyComplete,
    submitCheckin,
  };
};
