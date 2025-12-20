import React from "react";
import { useNotification } from "@/kits/components/Notification";
import type { CheckoutStep } from "../common/types";
import type {
  IProjectAttendancePhotoConfig,
  IProjectGpsConfig,
} from "@/types/model";
import { getPhotoCaptureDescription } from "../../../checkin/common/utils";

interface UseCheckoutNotificationsOptions {
  currentStep: CheckoutStep;
  photoConfig: IProjectAttendancePhotoConfig | null | undefined;
  isLocalizing: boolean;
  hasLocation?: boolean;
  gpsConfig?: IProjectGpsConfig | null | undefined;
}

/**
 * Hook to manage notifications for checkout process
 */
export const useCheckoutNotifications = ({
  currentStep,
  photoConfig,
  isLocalizing,
  hasLocation = false,
  gpsConfig,
}: UseCheckoutNotificationsOptions) => {
  const notification = useNotification();

  const checkoutStatusNotificationIdRef = React.useRef<string | null>(null);
  const rangeWarningNotificationIdRef = React.useRef<string | null>(null);
  const captureGuideNotificationIdRef = React.useRef<string | null>(null);

  // Show GPS notification
  React.useEffect(() => {
    if (currentStep === "gps" && !checkoutStatusNotificationIdRef.current && !hasLocation) {
      checkoutStatusNotificationIdRef.current = notification.pending({
        title: "Định vị",
        description: "Đang xác định vị trí của bạn...",
        options: {
          immortal: true,
        },
      });
    }
  }, [currentStep, notification, hasLocation]);

  // Remove GPS notification when location is available or leaving GPS step
  React.useEffect(() => {
    if (currentStep !== "gps" || (hasLocation && !isLocalizing)) {
      if (checkoutStatusNotificationIdRef.current) {
        notification.remove(checkoutStatusNotificationIdRef.current);
        checkoutStatusNotificationIdRef.current = null;
      }
    }
  }, [currentStep, hasLocation, isLocalizing, notification]);

  // Show capture notification
  React.useEffect(() => {
    if (currentStep === "capture" && !captureGuideNotificationIdRef.current) {
      const description = getPhotoCaptureDescription(photoConfig);

      captureGuideNotificationIdRef.current = notification.info({
        title: "Chụp ảnh",
        description,
        options: {
          immortal: true,
        },
      });
    }
  }, [currentStep, photoConfig, notification]);

  // Cleanup notifications on unmount
  React.useEffect(() => {
    return () => {
      if (checkoutStatusNotificationIdRef.current) {
        notification.remove(checkoutStatusNotificationIdRef.current);
      }
      if (rangeWarningNotificationIdRef.current) {
        notification.remove(rangeWarningNotificationIdRef.current);
      }
      if (captureGuideNotificationIdRef.current) {
        notification.remove(captureGuideNotificationIdRef.current);
      }
      notification.clear();
    };
  }, [notification]);

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
        notification.remove(rangeWarningNotificationIdRef.current);
        rangeWarningNotificationIdRef.current = null;
      }
      return;
    }

    // Only show warning in strict mode
    if (!rangeWarningNotificationIdRef.current) {
      rangeWarningNotificationIdRef.current = notification.warning({
        title: "Định vị",
        description: "Bạn đang ở ngoài khu vực check out!",
        options: {
          immortal: true,
        },
      });
    }
  }, [notification, isStrictGpsMode]);

  const hideRangeWarning = React.useCallback(() => {
    if (rangeWarningNotificationIdRef.current) {
      notification.remove(rangeWarningNotificationIdRef.current);
      rangeWarningNotificationIdRef.current = null;
    }
  }, [notification]);

  // Update GPS error notification
  const updateGpsError = React.useCallback(
    (message: string) => {
      if (checkoutStatusNotificationIdRef.current) {
        notification.update(checkoutStatusNotificationIdRef.current, {
          type: "error",
          description: message,
        });
      }
    },
    [notification],
  );

  // Remove capture notification
  const removeCaptureNotification = React.useCallback(() => {
    if (captureGuideNotificationIdRef.current) {
      notification.remove(captureGuideNotificationIdRef.current);
      captureGuideNotificationIdRef.current = null;
    }
  }, [notification]);

  // Auto-remove range warning when GPS config changes to non-strict mode
  React.useEffect(() => {
    if (!isStrictGpsMode && rangeWarningNotificationIdRef.current) {
      notification.remove(rangeWarningNotificationIdRef.current);
      rangeWarningNotificationIdRef.current = null;
    }
  }, [isStrictGpsMode, notification]);

  return {
    showRangeWarning,
    hideRangeWarning,
    updateGpsError,
    removeCaptureNotification,
  };
};
