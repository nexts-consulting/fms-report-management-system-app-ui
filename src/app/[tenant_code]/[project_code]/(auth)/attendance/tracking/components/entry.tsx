"use client";

import { CheckoutConfirm } from "@/components/CheckoutConfirm";
import { LeaveStartConfirm } from "@/components/LeaveStartConfirm";
import { UserHeader } from "@/components/UserHeader";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useShiftDurationFormated } from "@/hooks/shift/use-shift-duration-formated";
import { Icons } from "@/kits/components/Icons";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { Modal } from "@/kits/components/Modal";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { TrackingProgress } from "@/kits/widgets/TrackingProgress";
import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";
import { reportMenuItems } from "./menuItems";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

import {
  Box,
  StoragePool,
  ReportData,
  Gift,
  Image,
  RecentlyViewed,
  ShoppingCart,
  Customer,
} from "@carbon/icons-react";


const iconMap: Record<string, any> = {
  Box,
  StoragePool,
  ReportData,
  Gift,
  Image,
  RecentlyViewed,
  ShoppingCart,
  Customer,
};

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const selectedLocation = globalStore.use.selectedLocation();
  const showCheckoutConfirmation = globalStore.use.showCheckoutConfirmation();
  const showLeaveConfirmation = globalStore.use.showLeaveConfirmation();

  const router = useRouter();
  
  const { buildPath } = useTenantProjectPath();
  const [confirmCheckoutLoading, setConfirmCheckoutLoading] = React.useState(false);

  const shiftDurationFormated = useShiftDurationFormated({
    startTime: new Date(currentAttendance?.shift_start_time ?? ""),
    endTime: new Date(currentAttendance?.shift_end_time ?? ""),
  });

  const reportStatus = {
    leaveStart: false,
  };

  const handleAction = (item: any) => {
    if (item.action_type === "route") {
      router.push( buildPath(item.path ?? ""));
    } else if (item.action_type === "modal") {
      globalStore.setState({ [item.action_value ?? ""]: true });
    }
  };

  const isShiftEnded = React.useMemo(() => {
    return moment().isAfter(moment(currentAttendance?.shift_end_time ?? ""));
  }, [currentAttendance]);


  const handleConfirmCheckout = React.useCallback(() => {
    setConfirmCheckoutLoading(true);

    setTimeout(() => {
      globalStore.setState({
        showCheckoutConfirmation: false,
      });
      setConfirmCheckoutLoading(false);
      router.push(buildPath("/attendance/checkout"));
    }, 1000);
  }, [router]);

  React.useEffect(() => {
    return () => {
      globalStore.setState({
        showCheckoutConfirmation: false,
      });
    };
  }, []);

  if (!currentAttendance) {
    return <></>;
  }

  return (
    <>
      <LoadingOverlay active={confirmCheckoutLoading} />

      <UserHeader
        name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
        code={user?.username ?? ""}
        avatar={""}
        isOnWorking={true}
      />

      <div className="my-4 space-y-2 px-4">
        {/* Checkout Notify */}
        {isShiftEnded && (
          <NotificationBanner
            type="success"
            title="Hoàn thành ca làm việc"
            description={
              <p>Ca làm việc của bạn đã hoàn thành, vui lòng check out để kết thúc ca làm việc!</p>
            }
            closeable={false}
          />
        )}
      </div>

      <div className="px-4">
        <TrackingProgress
          startTime={new Date(currentAttendance.shift_start_time ?? "")}
          endTime={new Date(currentAttendance.shift_end_time ?? "")}
          startTrackingTime={new Date(currentAttendance.checkin_time ?? "")}
        />

        <div className="divide-y divide-gray-30">
          {/* Shift Info */}
          <div className="mt-2 grid grid-cols-3 divide-x divide-gray-30">
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Login className="shrink-0 text-green-50" />
              <div>
                <p className="line-clamp-1 text-xs font-medium text-gray-70">
                  {moment(currentAttendance.shift_start_time ?? "").format("HH:mm A")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Logout className="shrink-0 text-red-50" />
              <div>
                <p className="line-clamp-1 text-xs font-medium text-gray-70">
                  {moment(currentAttendance.shift_end_time ?? "").format("HH:mm A")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Time className="shrink-0 text-gray-50" />
              <div>
                <p className="line-clamp-1 text-xs font-medium text-gray-70">
                  {shiftDurationFormated}
                </p>
              </div>
            </div>
          </div>
          {/* Outlet Info */}
          <div className="flex items-center justify-center gap-4 bg-white p-4">
            <Icons.Location className="shrink-0 text-gray-50" />
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">
                {currentAttendance.location_name ?? ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 px-4">
        <div className="grid grid-cols-3">
          {reportMenuItems.map((item, idx) => {
            const done = false; // TODO: Implement report status
            // TODO: Implement report status
            const icon = iconMap[item.icon as string] || Box;
            const notchColor = false
              ? done
                ? "bg-green-500"
                : "bg-red-500"
              : "bg-gray-500";
            return (
              <div
                key={idx}
                onClick={() => handleAction(item)}
                className="relative flex h-28 w-full cursor-pointer flex-col items-center justify-center border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
              >
                {/* Notch trạng thái */}
                <div className={`absolute right-2 top-2 h-2 w-2 ${notchColor}`} />

                {React.createElement(icon, { className: "mb-2 h-6 w-6 text-gray-700" })}
                <p className="text-center text-sm font-medium leading-tight text-gray-700">
                  {item.name ?? ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-20 pb-8" />

      {/* Checkout Confirm */}
      <Modal
        isOpen={showCheckoutConfirmation}
        onClose={() => globalStore.setState({ showCheckoutConfirmation: false })}
        title="Check out"
      >
        {currentAttendance && (
          <CheckoutConfirm
            attendanceDetail={currentAttendance}
            location={selectedLocation}
            onConfirm={handleConfirmCheckout}
            onCancel={() => globalStore.setState({ showCheckoutConfirmation: false })}
          />
        )}
      </Modal>

      {/* Leave Start Confirm */}
      <Modal
        isOpen={showLeaveConfirmation}
        onClose={() => globalStore.setState({ showLeaveConfirmation: false })}
        title="Tạm rời vị trí"
      >
        <LeaveStartConfirm />
      </Modal>
    </>
  );
};
