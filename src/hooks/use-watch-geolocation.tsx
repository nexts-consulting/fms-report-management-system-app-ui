import { useState, useEffect, useCallback, useRef } from "react";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export enum GeolocationErrorType {
  PERMISSION_DENIED = "PERMISSION_DENIED",
  POSITION_UNAVAILABLE = "POSITION_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",
  BROWSER_NOT_SUPPORTED = "BROWSER_NOT_SUPPORTED",
  UNKNOWN = "UNKNOWN",
}

interface GeolocationError {
  type: GeolocationErrorType;
  message: string;
}

interface UseWatchLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onSuccess?: (location: Location) => void;
  onError?: (error: GeolocationError) => void;
  onPermissionDenied?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export const useWatchGeolocation = ({
  enableHighAccuracy = true,
  timeout = 30000,
  maximumAge = 0,
  onSuccess,
  onError,
  onPermissionDenied,
  maxRetries = 3,
  retryDelay = 1000,
  active = true,
  onActiveChange,
}: UseWatchLocationOptions = {}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [watching, setWatching] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const getCurrentPositionRetryCountRef = useRef(0);

  const watchIdRef = useRef<number>();
  const permissionListenerRef = useRef<(() => void) | null>(null);

  const callbacksRef = useRef({
    onSuccess,
    onError,
    onPermissionDenied,
  });

  useEffect(() => {
    callbacksRef.current = {
      onSuccess,
      onError,
      onPermissionDenied,
    };
  }, [onSuccess, onError, onPermissionDenied]);

  const handleError = useCallback((type: GeolocationErrorType, message: string) => {
    const error = { type, message };
    setError(error);
    callbacksRef.current.onError?.(error);
  }, []);

  const requestAndWatchLocation = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const getCurrentPositionWithRetry = async (): Promise<GeolocationPosition> => {
      try {
        const currentRetry = getCurrentPositionRetryCountRef.current;
        const adjustedTimeout = Math.max(timeout - currentRetry * 5000, 5000); // reduce 5s each time, minimum 5s
        const adjustedMaximumAge = currentRetry * 10000; // increase 10s each time
        const adjustedEnableHighAccuracy = currentRetry < maxRetries - 1;

        return await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: adjustedEnableHighAccuracy,
            timeout: adjustedTimeout,
            maximumAge: adjustedMaximumAge,
          });
        });
      } catch (error) {
        if (getCurrentPositionRetryCountRef.current < maxRetries) {
          getCurrentPositionRetryCountRef.current++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return getCurrentPositionWithRetry();
        }
        throw error;
      }
    };

    try {
      // Check browser support
      if (!navigator.geolocation) {
        handleError(
          GeolocationErrorType.BROWSER_NOT_SUPPORTED,
          "Trình duyệt của bạn không hỗ trợ Geolocation.",
        );
        return;
      }

      // Check permission
      const permission = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      setPermissionStatus(permission.state);

      if (permission.state === "denied") {
        handleError(
          GeolocationErrorType.PERMISSION_DENIED,
          "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.",
        );
        callbacksRef.current.onPermissionDenied?.();
        return;
      }

      if (permission.state === "prompt" || permission.state === "granted") {
        try {
          await getCurrentPositionWithRetry();
        } catch (error) {
          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                handleError(
                  GeolocationErrorType.PERMISSION_DENIED,
                  "Vui lòng cho phép truy cập vị trí!",
                );
                break;
              case error.POSITION_UNAVAILABLE:
                handleError(
                  GeolocationErrorType.POSITION_UNAVAILABLE,
                  "Không thể xác định vị trí của bạn.",
                );
                break;
              case error.TIMEOUT:
                handleError(GeolocationErrorType.TIMEOUT, "Quá thời gian chờ xác định vị trí.");
                break;
            }
          } else {
            handleError(GeolocationErrorType.UNKNOWN, "Có lỗi không xác định khi truy cập vị trí.");
          }
          return;
        }
      }

      setWatching(true);

      // Watch position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(newLocation);
          setError(null);
          callbacksRef.current.onSuccess?.(newLocation);
        },
        (error) => {
          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                handleError(
                  GeolocationErrorType.PERMISSION_DENIED,
                  "Quyền truy cập vị trí bị từ chối.",
                );
                break;
              case error.POSITION_UNAVAILABLE:
                handleError(
                  GeolocationErrorType.POSITION_UNAVAILABLE,
                  "Không thể xác định vị trí của bạn.",
                );
                break;
              case error.TIMEOUT:
                handleError(GeolocationErrorType.TIMEOUT, "Quá thời gian chờ xác định vị trí.");
                break;
            }
          }
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );

      // Permission change listener
      const handlePermissionChange = () => {
        setPermissionStatus(permission.state);
        if (permission.state === "denied") {
          handleError(
            GeolocationErrorType.PERMISSION_DENIED,
            "Quyền truy cập vị trí đã bị từ chối.",
          );
          callbacksRef.current.onPermissionDenied?.();
        }
      };

      permission.addEventListener("change", handlePermissionChange);
      permissionListenerRef.current = () => {
        permission.removeEventListener("change", handlePermissionChange);
      };
    } catch (error) {
      handleError(GeolocationErrorType.UNKNOWN, "Có lỗi không xác định khi truy cập vị trí.");
    }
  }, [enableHighAccuracy, timeout, maximumAge, handleError, maxRetries, retryDelay]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (active) {
      requestAndWatchLocation();
      onActiveChange?.(true);
    } else {
      // Clear watch when inactive
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = undefined;
      }
      setWatching(false);
      onActiveChange?.(false);
    }

    // Cleanup function
    return () => {
      // Clear watch
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = undefined;
      }

      // Remove permission listener
      if (permissionListenerRef.current) {
        permissionListenerRef.current();
        permissionListenerRef.current = null;
      }

      setWatching(false);
    };
  }, [requestAndWatchLocation, active]);

  if (typeof window === "undefined") {
    return {
      location: null,
      error: null,
      watching: false,
      permissionStatus: null,
      requestAndWatchLocation,
    };
  }

  return {
    location,
    error,
    watching,
    permissionStatus,
    requestAndWatchLocation,
  };
};
