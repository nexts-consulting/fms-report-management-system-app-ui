import React from "react";
import { useWatchGeolocation, GeolocationErrorType } from "@/hooks/use-watch-geolocation";
import type { CheckinStep, UserGeolocation } from "../common/types";

interface UseCheckinGeolocationOptions {
  currentStep: CheckinStep;
  onLocationUpdate?: (location: UserGeolocation) => void;
  onError?: (error: { type: GeolocationErrorType; message: string }) => void;
}

/**
 * Hook to manage geolocation for check-in process
 */
export const useCheckinGeolocation = ({
  currentStep,
  onLocationUpdate,
  onError,
}: UseCheckinGeolocationOptions) => {
  const [isLocalizing, setIsLocalizing] = React.useState(false);
  const [userGeolocation, setUserGeolocation] = React.useState<UserGeolocation | null>(null);

  const handleOnActive = React.useCallback((isActive: boolean) => {
    setIsLocalizing(isActive);
  }, []);

  const handleOnError = React.useCallback(
    (error: { type: GeolocationErrorType; message: string }) => {
      setTimeout(() => {
        setIsLocalizing(false);
      }, 1000);
      onError?.(error);
    },
    [onError],
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

  // Update user geolocation when location changes
  React.useEffect(() => {
    if (location) {
      const geolocation: UserGeolocation = {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
      };
      setUserGeolocation(geolocation);
      onLocationUpdate?.(geolocation);
    }
  }, [location]);

  const confirmLocation = React.useCallback(() => {
    if (!location) return;

    const geolocation: UserGeolocation = {
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy,
    };
    setUserGeolocation(geolocation);
    onLocationUpdate?.(geolocation);
  }, [location]);

  return {
    location,
    error,
    isLocalizing,
    userGeolocation,
    confirmLocation,
  };
};
