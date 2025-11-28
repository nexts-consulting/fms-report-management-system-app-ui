"use client";

import { CheckoutConfirm } from "@/components/CheckoutConfirm";
import { LeaveList } from "@/components/LeaveList";
import { LeaveStartConfirm } from "@/components/LeaveStartConfirm";
import { UserHeader } from "@/components/UserHeader";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useShiftDurationFormated } from "@/hooks/use-shift-duration-formated";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { Modal } from "@/kits/components/Modal";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { TrackingProgress } from "@/kits/widgets/TrackingProgress";
import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";
import { reportMenuItems } from "./menuItems";
import { ReportMenuItem } from "@/types/model";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();

  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();
  const showCheckoutConfirmation = globalStore.use.showCheckoutConfirmation();
  const showLeaveConfirmation = globalStore.use.showLeaveConfirmation();

  const router = useRouter();

  const [confirmCheckoutLoading, setConfirmCheckoutLoading] = React.useState(false);

  const isReportedOOS = React.useMemo(() => {
    return currentAttendance?.oosReport !== null;
  }, [currentAttendance]);

  const isReportedStockIn = React.useMemo(() => {
    return currentAttendance?.stockInReport !== null;
  }, [currentAttendance]);

  const isReportedStockOut = React.useMemo(() => {
    return currentAttendance?.stockOutReport !== null;
  }, [currentAttendance]);

  const isReportedSales = React.useMemo(() => {
    return currentAttendance?.saleReport !== null;
  }, [currentAttendance]);

  const isReportedSampling = React.useMemo(() => {
    return currentAttendance?.samplingReport !== null;
  }, [currentAttendance]);

  const shiftDurationFormated = useShiftDurationFormated({
    startTime: new Date(currentAttendance?.shift.startTime ?? ""),
    endTime: new Date(currentAttendance?.shift.endTime ?? ""),
  });

  const reportStatus = {
    isReportedStockIn,
    isReportedStockOut,
    isReportedSampling,
    leaveStart: false,
  };

  const handleAction = (item: ReportMenuItem) => {
    if (item.actionType === "route") {
      router.push(item.actionValue ?? "");
    } else if (item.actionType === "modal") {
      globalStore.setState({ [item.actionValue ?? ""]: true });
    }
  };

  const isShiftEnded = React.useMemo(() => {
    return moment().isAfter(moment(currentAttendance?.shift.endTime ?? ""));
  }, [currentAttendance]);

  const filteredReportMenuItems = React.useMemo(() => {
    return reportMenuItems.filter((item) => {
      if (item.role) {
        return user?.account?.role === item.role;
      }
      return true;
    });
  }, [user]);

  const handleConfirmCheckout = React.useCallback(() => {
    setConfirmCheckoutLoading(true);

    setTimeout(() => {
      globalStore.setState({
        showCheckoutConfirmation: false,
      });
      setConfirmCheckoutLoading(false);
      router.push("/attendance/checkout");
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
        name={user?.fullName ?? ""}
        code={user?.staffCode ?? ""}
        avatar={user?.profileImage ?? ""}
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
          startTime={new Date(currentAttendance.shift.startTime)}
          endTime={new Date(currentAttendance.shift.endTime)}
          startTrackingTime={new Date(currentAttendance.checkinTime)}
        />

        <div className="divide-y divide-gray-30">
          {/* Shift Info */}
          <div className="mt-2 grid grid-cols-3 divide-x divide-gray-30">
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Login className="shrink-0 text-green-50" />
              <div>
                <p className="line-clamp-1 text-xs font-medium text-gray-70">
                  {moment(currentAttendance.shift.startTime).format("HH:mm A")}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-start gap-4 bg-white p-4">
              <Icons.Logout className="shrink-0 text-red-50" />
              <div>
                <p className="line-clamp-1 text-xs font-medium text-gray-70">
                  {moment(currentAttendance.shift.endTime).format("HH:mm A")}
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
                {currentAttendance.shift.outlet.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 px-4">
        <div className="grid grid-cols-3">
          {filteredReportMenuItems.map((item, idx) => {
            const done = reportStatus[item.key as keyof typeof reportStatus] ?? false;

            const notchColor = item.required
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

                <item.icon className="mb-2 h-6 w-6 text-gray-700" />
                <p className="text-center text-sm font-medium leading-tight text-gray-700">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4">
        <LeaveList />
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
            attendance={currentAttendance}
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
