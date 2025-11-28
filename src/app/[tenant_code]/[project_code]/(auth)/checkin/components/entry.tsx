"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { Localize } from "@/kits/widgets/Localize";
import { useRouter } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { useNotification } from "@/kits/components/Notification";
import { useWatchGeolocation, GeolocationErrorType } from "@/hooks/use-watch-geolocation";
import { useAuthContext } from "@/contexts/auth.context";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import { CheckinMap } from "@/kits/widgets/CheckinMap";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { AnimatedEllipsis } from "@/kits/components/AnimatedEllipsis";
import { useMutationAttendanceCheckin } from "@/services/api/attendance/checkin";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { EUserAccountRole } from "@/types/model";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const globalStore = useGlobalContext();
  const selectedWorkingShift = globalStore.use.selectedWorkingShift();

  const router = useRouter();
  const notification = useNotification();
  const { buildPath } = useTenantProjectPath();

  const [step, setStep] = React.useState<"localize" | "capture" | "submit">(
    "localize",
  );

  // Localize
  const [isLocalizing, setIsLocalizing] = React.useState(false);
  const checkinStatusNotificationIdRef = React.useRef<string | null>(null);
  const rangeWarningNotificationIdRef = React.useRef<string | null>(null);
  const [userGeolocation, setUserGeolocation] = React.useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  // Capture
  const [userImageFile, setUserImageFile] = React.useState<File | null>(null);
  const captureGuideNotificationIdRef = React.useRef<string | null>(null);

  // Submit
  const tips = ["Ca làm việc của bạn đang được tạo", "Chúc bạn có một ngày làm việc tốt lành!"];
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [allbeDone, setAllbeDone] = React.useState(false);

  const attendanceCheckinMutation = useMutationAttendanceCheckin({
    config: {
      onSuccess: (data) => {
        setCurrentTipIndex(1);
        setAllbeDone(true);
        globalStore.setState({
          currentAttendance: data.data,
        });

        setTimeout(() => {
          router.push("/attendance/tracking");
        }, 3000);
      },
      onError: (error) => {
        console.log(error);
        notification.error({
          title: "Lỗi hệ thống",
          description: "Có lỗi xảy ra khi tạo ca làm việc, vui lòng thử lại sau. Chi tiết: " + (error?.response?.data as any).message  || error?.message,
          options: {
            immortal: true,
          },
        });
      },
    },
  });

  const handleOnActive = React.useCallback((isActive: boolean) => {
    setIsLocalizing(isActive);
  }, []);

  const handleOnError = React.useCallback(
    (error: { type: GeolocationErrorType; message: string }) => {
      setTimeout(() => {
        setIsLocalizing(false);
        if (checkinStatusNotificationIdRef.current) {
          notification.update(checkinStatusNotificationIdRef.current, {
            type: "error",
            description: error.message,
          });
        }
      }, 1000);
    },
    [notification],
  );

  const handleOnSuccess = React.useCallback(() => {
    setTimeout(() => {
      setIsLocalizing(false);
      if (checkinStatusNotificationIdRef.current) {
        notification.remove(checkinStatusNotificationIdRef.current);
      }
    }, 1000);
  }, [notification]);

  const { location, error } = useWatchGeolocation({
    active: step === "localize",
    onActiveChange: handleOnActive,
    onError: handleOnError,
    onSuccess: handleOnSuccess,
  });

  const handleOnUpdateGps = React.useCallback(
    (e: { isUserInLocationScope: boolean | undefined }) => {
      if (isLocalizing || error) return;

      if (e.isUserInLocationScope) {
        if (rangeWarningNotificationIdRef.current) {
          notification.remove(rangeWarningNotificationIdRef.current);
        }
      }

      if (e.isUserInLocationScope === false) {
        if (!rangeWarningNotificationIdRef.current) {
          rangeWarningNotificationIdRef.current = notification.warning({
            title: "Định vị",
            description: "Bạn đang ở ngoài khu vực check in!",
            options: {
              immortal: true,
            },
          });
        }
      }
    },
    [isLocalizing, error],
  );

  const handleConfirmLocalize = React.useCallback(() => {
    if (!location) return;

    setUserGeolocation({
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy,
    });
    setStep("capture");
  }, [location]);

  const handleOnCapture = React.useCallback(() => {
    if (captureGuideNotificationIdRef.current) {
      notification.remove(captureGuideNotificationIdRef.current);
    }
  }, []);

  const handleConfirmCapture = React.useCallback(
    (file: File) => {
      setUserImageFile(file);
      setStep("submit");

      if (!selectedWorkingShift || !userGeolocation) return;

      // Submit
      attendanceCheckinMutation.mutate({
        staffId: user.id,
        shiftId: selectedWorkingShift.id,
        location: {
          lat: userGeolocation.lat,
          lng: userGeolocation.lng,
          acc: userGeolocation.accuracy,
        },
        file,
      });
    },
    [selectedWorkingShift, userGeolocation],
  );

  const handleOnCameraError = React.useCallback((error: string) => {
    if (captureGuideNotificationIdRef.current) {
      notification.remove(captureGuideNotificationIdRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (step === "localize" && !checkinStatusNotificationIdRef.current) {
      checkinStatusNotificationIdRef.current = notification.pending({
        title: "Định vị",
        description: "Đang xác định vị trí của bạn...",
        options: {
          immortal: true,
        },
      });
    }

    if (step === "capture" && !captureGuideNotificationIdRef.current) {
      captureGuideNotificationIdRef.current = notification.info({
        title: "Chụp ảnh",
        description: "Vui lòng chụp rõ khuôn mặt của bạn để xác thực",
        options: {
          immortal: true,
        },
      });
    }
  }, [step]);

  React.useEffect(() => {
    return () => {
      // Remove notification when component unmount
      if (checkinStatusNotificationIdRef.current) {
        notification.remove(checkinStatusNotificationIdRef.current);
      }

      if (rangeWarningNotificationIdRef.current) {
        notification.remove(rangeWarningNotificationIdRef.current);
      }

      if (captureGuideNotificationIdRef.current) {
        notification.remove(captureGuideNotificationIdRef.current);
      }

      notification.clear();
    };
  }, []);

  React.useEffect(() => {
    if (!selectedWorkingShift) {
      router.replace(buildPath("/shift"));
    }
  }, [selectedWorkingShift]);

  React.useEffect(() => {
    if (user?.account?.role === EUserAccountRole.SALE) {
      router.replace(buildPath("/sale/lobby"));
    }
  }, [user, buildPath]);

  if (!selectedWorkingShift) {
    return <></>;
  }

  return (
    <>
      <LoadingOverlay active={allbeDone} />

      <div className="flex min-h-dvh flex-col">
        {step !== "submit" && (
          <ScreenHeader
            title="Check in"
            loading={isLocalizing}
            onBack={() => router.back()}
            containerClassName="mb-0"
          />
        )}

        {step === "localize" && (
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
                name: selectedWorkingShift.outlet.name,
                address: selectedWorkingShift.outlet.address,
                province: selectedWorkingShift.outlet.province.name,
                gps: {
                  lat: selectedWorkingShift.outlet.latitude,
                  lng: selectedWorkingShift.outlet.longitude,
                },
                radius: selectedWorkingShift.outlet.checkinRadiusMeters,
              }}
              shift={{
                name: selectedWorkingShift.name,
                startTime: new Date(selectedWorkingShift.startTime),
                endTime: new Date(selectedWorkingShift.endTime),
              }}
              onUpdateGps={handleOnUpdateGps}
              onContinue={handleConfirmLocalize}
            />
          </div>
        )}

        {step === "capture" && (
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

        {step === "submit" && (
          <div className="fixed left-0 right-0 top-1/2 -translate-y-2/3 p-4">
            <div className="bg-white p-4">
              <div className="aspect-[3/2] w-full flex-1">
                <CheckinMap
                  gps={{
                    lat: selectedWorkingShift.outlet.latitude,
                    lng: selectedWorkingShift.outlet.longitude,
                  }}
                />
              </div>
            </div>
            <LoadingBar active={attendanceCheckinMutation.isLoading} size="medium" />
            <div className="mt-4">
              <p className="text-center text-sm font-medium text-gray-50">
                <span dangerouslySetInnerHTML={{ __html: tips[currentTipIndex] }} />
                {currentTipIndex === 0 && <AnimatedEllipsis className="inline-block" />}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
