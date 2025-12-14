"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { Localize } from "@/kits/widgets/Localize";
import { useRouter } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { useWatchGeolocation, GeolocationErrorType } from "@/hooks/use-watch-geolocation";
import { useAuthContext } from "@/contexts/auth.context";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import { CheckinMap } from "@/kits/widgets/CheckinMap";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { AnimatedEllipsis } from "@/kits/components/AnimatedEllipsis";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { EUserAccountRole } from "@/types/model";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { useProjectConfigs } from "@/hooks/use-project-configs";
import { useCheckinFlow } from "../hooks/use-checkin-flow";
import { useCheckinSubmit } from "../hooks/use-checkin-submit";
import { useCheckinNotifications } from "../hooks/use-checkin-notifications";
import { getCheckinLocation } from "../common/utils";
import { CHECKIN_TIPS } from "../common/config";
import type { UserGeolocation, CheckinStep } from "../common/types";
import { Survey } from "@/components/Survey";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const globalStore = useGlobalContext();
  const selectedWorkingShift = globalStore.use.selectedWorkingShift();
  const {
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    isLoading: isLoadingConfigs,
  } = useProjectConfigs();

  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  // Checkin flow hook
  const {
    availableSteps,
    currentStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setCurrentStepIndex,
  } = useCheckinFlow({
    checkinFlow: projectCheckinFlow,
  });

  // State
  const [isLocalizing, setIsLocalizing] = React.useState(false);
  const [userGeolocation, setUserGeolocation] = React.useState<UserGeolocation | null>(null);
  const [userImageFile, setUserImageFile] = React.useState<File | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [allbeDone, setAllbeDone] = React.useState(false);

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
    submitWithoutPhoto,
    isLoading: isSubmitting,
  } = useCheckinSubmit({
    userId: user.id,
    workingShift: selectedWorkingShift,
    checkinLocation,
    checkinFlow: projectCheckinFlow,
    availableSteps,
    onStepChange: setCurrentStepIndex,
    onSuccess: () => {
      setCurrentTipIndex(1);
      setAllbeDone(true);
    },
  });

  const handleOnActive = React.useCallback((isActive: boolean) => {
    setIsLocalizing(isActive);
  }, []);

  const handleOnError = React.useCallback(
    (error: { type: GeolocationErrorType; message: string }) => {
      setTimeout(() => {
        setIsLocalizing(false);
      }, 1000);
    },
    [],
  );

  const handleOnSuccess = React.useCallback(() => {
    setTimeout(() => {
      setIsLocalizing(false);
    }, 1000);
  }, []);

  const { location, error } = useWatchGeolocation({
    active: currentStep === "gps",
    onActiveChange: handleOnActive,
    onError: handleOnError,
    onSuccess: handleOnSuccess,
  });

  // Notifications hook - must be after useWatchGeolocation to access location
  const {
    showRangeWarning,
    hideRangeWarning,
    updateGpsError,
    removeGpsNotification,
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
    if (error) {
      const errorMessage = error.message || "Không thể xác định vị trí";
      updateGpsError(errorMessage);
    }
  }, [error, updateGpsError]);

  const handleOnUpdateGps = React.useCallback(
    (e: { isUserInLocationScope: boolean | undefined }) => {
      if (isLocalizing || error) return;

      if (e.isUserInLocationScope) {
        hideRangeWarning();
      } else if (e.isUserInLocationScope === false) {
        showRangeWarning();
      }
    },
    [isLocalizing, error, showRangeWarning, hideRangeWarning],
  );

  const handleConfirmLocalize = React.useCallback(() => {
    if (!location) return;

    setUserGeolocation({
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy,
    });
    goToNextStep();
  }, [location, goToNextStep]);

  const handleOnCapture = React.useCallback(() => {
    removeCaptureNotification();
  }, [removeCaptureNotification]);

  const handleConfirmCapture = React.useCallback(
    (file: File) => {
      setUserImageFile(file);
      goToNextStep();
      submitCheckin(file);
    },
    [goToNextStep, submitCheckin],
  );

  const handleOnCameraError = React.useCallback(() => {
    removeCaptureNotification();
  }, [removeCaptureNotification]);

  // Handle survey completion - continue to next checkin step
  const handleSurveyComplete = React.useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // Handle pre-shift task step
  React.useEffect(() => {
    if (currentStep === "pre_shift_task" && projectCheckinFlow?.require_pre_shift_task) {
      // TODO: Implement pre-shift task component
      // For now, skip to next step
      goToNextStep();
    }
  }, [currentStep, projectCheckinFlow, goToNextStep]);

  // Handle post-shift task step
  React.useEffect(() => {
    if (currentStep === "post_shift_task" && projectCheckinFlow?.require_post_shift_task) {
      // TODO: Implement post-shift task component
      // For now, redirect to tracking
      router.push(buildPath("/attendance/tracking"));
    }
  }, [currentStep, projectCheckinFlow, router, buildPath]);

  React.useEffect(() => {
    if (!selectedWorkingShift) {
      router.replace(buildPath("/shift"));
    }
  }, [selectedWorkingShift, router, buildPath]);

  React.useEffect(() => {
    if (user?.account?.role === EUserAccountRole.SALE) {
      router.replace(buildPath("/sale/lobby"));
    }
  }, [user, router, buildPath]);

  // Auto-submit when reaching submit step if photo is not required and no file captured
  React.useEffect(() => {
    if (
      currentStep === "submit" &&
      projectAttendancePhotoConfig?.mode === "NOT_REQUIRED" &&
      !userImageFile
    ) {
      submitWithoutPhoto();
    }
  }, [currentStep, projectAttendancePhotoConfig, userImageFile, submitWithoutPhoto]);

  // Wait for configs to load - must be after all hooks
  if (isLoadingConfigs || !selectedWorkingShift) {
    return <></>;
  }

  return (
    <>
      <LoadingOverlay active={allbeDone} />

      <div className="flex min-h-dvh flex-col">
        {(() => {
          const stepsWithoutHeader: CheckinStep[] = [
            "submit",
            "survey",
            "pre_shift_task",
            "post_shift_task",
          ];
          const shouldShowHeader = !stepsWithoutHeader.includes(currentStep);

          return shouldShowHeader ? (
            <ScreenHeader
              title="Check in"
              loading={isLocalizing}
              onBack={goToPreviousStep}
              containerClassName="mb-0"
            />
          ) : null;
        })()}

        {currentStep === "gps" && projectCheckinFlow?.require_gps_at_location && (
          <div className="flex flex-1">
            <Localize
              user={
                location
                  ? {
                      id: user.id.toString(),
                      avatar: user.profileImage,
                      gps: {
                        lat: location.latitude,
                        lng: location.longitude,
                      },
                    }
                  : null
              }
              location={{
                name: selectedWorkingShift.location.name,
                address: selectedWorkingShift.location.address,
                province: selectedWorkingShift.location.province.name,
                gps: {
                  lat: selectedWorkingShift.location.latitude,
                  lng: selectedWorkingShift.location.longitude,
                },
                radius:
                  projectGpsConfig?.gps_radius_meters ??
                  selectedWorkingShift.location.checkinRadiusMeters,
              }}
              shift={{
                name: selectedWorkingShift.name,
                startTime: new Date(selectedWorkingShift.startTime),
                endTime: new Date(selectedWorkingShift.endTime),
              }}
              gpsConfig={
                projectGpsConfig
                  ? {
                      mode: projectGpsConfig.mode,
                      is_required: projectGpsConfig.is_required,
                    }
                  : undefined
              }
              onUpdateGps={handleOnUpdateGps}
              onContinue={handleConfirmLocalize}
            />
          </div>
        )}

        {currentStep === "capture" &&
          projectCheckinFlow?.require_attendance &&
          projectAttendancePhotoConfig?.mode !== "NOT_REQUIRED" && (
            <div className="flex flex-1">
              <CameraCapture
                enableUpload={false}
                enableCancel={false}
                onConfirm={handleConfirmCapture}
                onCapture={handleOnCapture}
                onError={handleOnCameraError}
              />
            </div>
          )}

        {currentStep === "survey" && projectCheckinFlow?.require_survey && (
          <Survey onComplete={handleSurveyComplete} onBack={goToPreviousStep} />
        )}

        {currentStep === "submit" && (
          <div className="fixed left-0 right-0 top-1/2 -translate-y-2/3 p-4">
            <div className="bg-white p-4">
              <div className="aspect-[3/2] w-full flex-1">
                <CheckinMap
                  gps={{
                    lat: selectedWorkingShift.location.latitude,
                    lng: selectedWorkingShift.location.longitude,
                  }}
                />
              </div>
            </div>
            <LoadingBar active={isSubmitting} size="medium" />
            <div className="mt-4">
              <p className="text-center text-sm font-medium text-gray-50">
                <span dangerouslySetInnerHTML={{ __html: CHECKIN_TIPS[currentTipIndex] }} />
                {currentTipIndex === 0 && <AnimatedEllipsis className="inline-block" />}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
