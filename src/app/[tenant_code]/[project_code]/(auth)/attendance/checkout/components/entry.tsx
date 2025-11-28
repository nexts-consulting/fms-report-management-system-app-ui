"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { Localize } from "@/kits/widgets/Localize";
import { useRouter } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { useNotification } from "@/kits/components/Notification";
import { useWatchGeolocation } from "@/hooks/use-watch-geolocation";
import { useAuthContext } from "@/contexts/auth.context";
import { CameraCapture } from "@/kits/widgets/CameraCapture";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { AnimatedEllipsis } from "@/kits/components/AnimatedEllipsis";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { CheckoutMap } from "@/kits/widgets/CheckoutMap";
import { useMutationAttendanceCheckout } from "@/services/api/attendance/checkout";
import { useQueryClient } from "react-query";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user()!;

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { buildPath } = useTenantProjectPath();

  const [step, setStep] = React.useState<"localize" | "capture" | "submit">("localize");

  // Localize
  const [isLocalizing, setIsLocalizing] = React.useState(true);
  const checkoutStatusNotificationIdRef = React.useRef<string | null>(null);
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
  const tips = ["Đang kết thúc ca làm việc", "Hẹn gặp lại bạn ở ca làm việc tiếp theo!"];
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);
  const [allbeDone, setAllbeDone] = React.useState(false);

  const attendanceCheckoutMutation = useMutationAttendanceCheckout({
    config: {
      onSuccess: (data) => {
        setCurrentTipIndex(1);
        setAllbeDone(true);

        setTimeout(() => {
          globalStore.setState({
            selectedWorkingShift: null,
            currentAttendance: null,
          });
          notification.clear();
          setAllbeDone(false);
          router.replace(buildPath("/lobby?force=true"));
        }, 3000);
      },
      onError: (error) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Có lỗi xảy ra khi kết thúc ca làm việc, vui lòng thử lại sau",
          options: {
            immortal: true,
          },
        });
      },
    },
  });

  const { location, error } = useWatchGeolocation({
    onError: (error) => {
      setTimeout(() => {
        setIsLocalizing(false);
        if (checkoutStatusNotificationIdRef.current) {
          notification.update(checkoutStatusNotificationIdRef.current, {
            type: "error",
            description: error.message,
          });
        }
      }, 1000);
    },
    onSuccess: () => {
      setTimeout(() => {
        setIsLocalizing(false);
        if (checkoutStatusNotificationIdRef.current) {
          notification.remove(checkoutStatusNotificationIdRef.current);
        }
      }, 1000);
    },
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
            description: "Bạn đang ở ngoài khu vực check out!",
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

      if (!currentAttendance || !userGeolocation) return;

      // Submit
      attendanceCheckoutMutation.mutate({
        staffId: user.id,
        shiftId: currentAttendance.shift.id,
        location: {
          lat: userGeolocation.lat,
          lng: userGeolocation.lng,
          acc: userGeolocation.accuracy,
        },
        file,
      });
    },
    [currentAttendance, userGeolocation],
  );

  const handleOnCameraError = React.useCallback((error: string) => {
    if (captureGuideNotificationIdRef.current) {
      notification.remove(captureGuideNotificationIdRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (step === "localize" && !checkoutStatusNotificationIdRef.current) {
      checkoutStatusNotificationIdRef.current = notification.pending({
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
  }, []);

  if (!currentAttendance) {
    return <></>;
  }

  return (
    <>
      <LoadingOverlay active={allbeDone} />

      <div className="flex min-h-dvh flex-col">
        {step !== "submit" && (
          <ScreenHeader
            title="Check out"
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
                name: currentAttendance.shift.outlet.name,
                address: currentAttendance.shift.outlet.address,
                province: currentAttendance.shift.outlet.province.name,
                gps: {
                  lat: currentAttendance.shift.outlet.latitude,
                  lng: currentAttendance.shift.outlet.longitude,
                },
                radius: currentAttendance.shift.outlet.checkinRadiusMeters,
              }}
              shift={{
                name: currentAttendance.shift.name,
                startTime: new Date(currentAttendance.shift.startTime),
                endTime: new Date(currentAttendance.shift.endTime),
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
                <CheckoutMap
                  gps={{
                    lat: currentAttendance.shift.outlet.latitude,
                    lng: currentAttendance.shift.outlet.longitude,
                  }}
                />
              </div>
            </div>
            <LoadingBar active={attendanceCheckoutMutation.isLoading} size="medium" />
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
