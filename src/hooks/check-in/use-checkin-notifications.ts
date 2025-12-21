import React from "react";
import { useNotification } from "@/kits/components/notification";
import type { CheckinStep } from "../../app/[tenant_code]/[project_code]/(auth)/checkin/common/types";
import type {
  IProjectAttendancePhotoConfig,
  IProjectGpsConfig,
} from "@/types/model";
import { getPhotoCaptureDescription } from "../../app/[tenant_code]/[project_code]/(auth)/checkin/common/utils";

interface UseCheckinNotificationsOptions {
  currentStep: CheckinStep;
  photoConfig: IProjectAttendancePhotoConfig | null | undefined;
  isLocalizing: boolean;
  hasLocation?: boolean;
  gpsConfig?: IProjectGpsConfig | null | undefined;
}

export const useCheckinNotifications = ({
  currentStep,
  photoConfig,
  isLocalizing,
  hasLocation = false,
  gpsConfig,
}: UseCheckinNotificationsOptions) => {
  const notification = useNotification();

  // Store notification methods in refs to avoid dependency issues
  const notificationMethodsRef = React.useRef(notification);
  React.useEffect(() => {
    notificationMethodsRef.current = notification;
  }, [notification]);

  const checkinStatusNotificationIdRef = React.useRef<string | null>(null);
  const rangeWarningNotificationIdRef = React.useRef<string | null>(null);
  const captureGuideNotificationIdRef = React.useRef<string | null>(null);

  // Show GPS notification
  React.useEffect(() => {
    if (currentStep === "gps" && !checkinStatusNotificationIdRef.current && !hasLocation) {
      checkinStatusNotificationIdRef.current = notificationMethodsRef.current.pending({
        title: "Định vị",
        description: "Đang xác định vị trí của bạn...",
        options: {
          immortal: true,
        },
      });
    }
  }, [currentStep, hasLocation]);

  // Remove GPS notification when location is available or leaving GPS step
  React.useEffect(() => {
    if (currentStep !== "gps" || (hasLocation && !isLocalizing)) {
      if (checkinStatusNotificationIdRef.current) {
        notificationMethodsRef.current.remove(checkinStatusNotificationIdRef.current);
        checkinStatusNotificationIdRef.current = null;
      }
    }
  }, [currentStep, hasLocation, isLocalizing]);

  // Show capture notification
  React.useEffect(() => {
    if (currentStep === "capture" && !captureGuideNotificationIdRef.current) {
      const description = getPhotoCaptureDescription(photoConfig);

      captureGuideNotificationIdRef.current = notificationMethodsRef.current.info({
        title: "Chụp ảnh",
        description,
        options: {
          immortal: true,
        },
      });
    }
  }, [currentStep, photoConfig]);

  // Cleanup notifications on unmount
  React.useEffect(() => {
    return () => {
      if (checkinStatusNotificationIdRef.current) {
        notificationMethodsRef.current.remove(checkinStatusNotificationIdRef.current);
      }
      if (rangeWarningNotificationIdRef.current) {
        notificationMethodsRef.current.remove(rangeWarningNotificationIdRef.current);
      }
      if (captureGuideNotificationIdRef.current) {
        notificationMethodsRef.current.remove(captureGuideNotificationIdRef.current);
      }
      notificationMethodsRef.current.clear();
    };
  }, []); // Only run cleanup on unmount - notification methods are stable

  /**
   * Check if GPS config is in strict mode
   */
  const isStrictGpsMode = React.useMemo(() => {
    return gpsConfig?.mode === "REQUIRED_AT_LOCATION";
  }, [gpsConfig?.mode]);

  // Handle GPS range warning - only show when GPS mode is strict (REQUIRED_AT_LOCATION)
  const showRangeWarning = React.useCallback(() => {
    // If not strict mode, remove any existing warning
    if (!isStrictGpsMode) {
      if (rangeWarningNotificationIdRef.current) {
        notificationMethodsRef.current.remove(rangeWarningNotificationIdRef.current);
        rangeWarningNotificationIdRef.current = null;
      }
      return;
    }

    // Only show warning in strict mode
    if (!rangeWarningNotificationIdRef.current) {
      rangeWarningNotificationIdRef.current = notificationMethodsRef.current.warning({
        title: "Định vị",
        description: "Bạn đang ở ngoài khu vực check in!",
        options: {
          immortal: true,
        },
      });
    }
  }, [isStrictGpsMode]);

  const hideRangeWarning = React.useCallback(() => {
    if (rangeWarningNotificationIdRef.current) {
      notificationMethodsRef.current.remove(rangeWarningNotificationIdRef.current);
      rangeWarningNotificationIdRef.current = null;
    }
  }, []);

  // Update GPS error notification
  const updateGpsError = React.useCallback((message: string) => {
    if (checkinStatusNotificationIdRef.current) {
      notificationMethodsRef.current.update(checkinStatusNotificationIdRef.current, {
        type: "error",
        description: message,
      });
    }
  }, []);

  // Remove GPS notification
  const removeGpsNotification = React.useCallback(() => {
    if (checkinStatusNotificationIdRef.current) {
      notificationMethodsRef.current.remove(checkinStatusNotificationIdRef.current);
      checkinStatusNotificationIdRef.current = null;
    }
  }, []);

  // Remove capture notification
  const removeCaptureNotification = React.useCallback(() => {
    if (captureGuideNotificationIdRef.current) {
      notificationMethodsRef.current.remove(captureGuideNotificationIdRef.current);
      captureGuideNotificationIdRef.current = null;
    }
  }, []);

  // Auto-remove range warning when GPS config changes to non-strict mode
  React.useEffect(() => {
    if (!isStrictGpsMode && rangeWarningNotificationIdRef.current) {
      notificationMethodsRef.current.remove(rangeWarningNotificationIdRef.current);
      rangeWarningNotificationIdRef.current = null;
    }
  }, [isStrictGpsMode]);

  return {
    showRangeWarning,
    hideRangeWarning,
    updateGpsError,
    removeGpsNotification,
    removeCaptureNotification,
  };
};
