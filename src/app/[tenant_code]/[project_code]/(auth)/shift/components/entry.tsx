"use client";

import { CheckInConfirm } from "@/components/CheckInConfirm";
import { ScreenFooter } from "@/components/ScreenFooter";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useGlobalContext } from "@/contexts/global.context";
import { useShiftDurationFormated } from "@/hooks/use-shift-duration-formated";
import { useShiftStatus } from "@/hooks/use-shift-status";
import { useShiftTime } from "@/hooks/use-shift-time";
import { useShiftUpcoming } from "@/hooks/use-shift-upcoming";
import { Button } from "@/kits/components/Button";
import { Icons } from "@/kits/components/Icons";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { Modal } from "@/kits/components/Modal";
import { useNotification } from "@/kits/components/Notification";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { StringUtil, StyleUtil } from "@/kits/utils";
import { useQueryWorkingShiftListByOutlet } from "@/services/api/working-shift/list-by-outlet";
import { IWorkingShift } from "@/types/model";
import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";

export const Entry = () => {
  const globalStore = useGlobalContext();
  const selectedOutlet = globalStore.use.selectedOutlet();

  const router = useRouter();
  const notification = useNotification();

  const [selectedWorkingShift, setSelectedWorkingShift] = React.useState<IWorkingShift | null>(
    null,
  );
  const [confirmLoading, setConfirmLoading] = React.useState(false);

  const workingShiftListByOutletQuery = useQueryWorkingShiftListByOutlet({
    params: {
      outletId: selectedOutlet?.id ?? 0,
    },
    config: {
      enabled: !!selectedOutlet,
      onError: (error) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách ca làm việc",
          options: {
            duration: 5000,
          },
        });
      },
    },
  });

  const upcomingShifts = useShiftUpcoming(workingShiftListByOutletQuery.data?.data ?? []);

  const handleConfirm = React.useCallback(() => {
    globalStore.setState({
      selectedWorkingShift: selectedWorkingShift,
    });

    setConfirmLoading(true);

    setTimeout(() => {
      setConfirmLoading(false);
      router.push("/checkin");
    }, 1000);
  }, [selectedWorkingShift]);

  const handleCancel = React.useCallback(() => {
    setSelectedWorkingShift(null);
  }, []);

  return (
    <>
      <LoadingOverlay active={confirmLoading} />

      <ScreenHeader
        title="Ca làm việc"
        loading={
          workingShiftListByOutletQuery.isLoading || workingShiftListByOutletQuery.isFetching
        }
        onBack={() => router.back()}
      />

      <div className="px-4">
        {(workingShiftListByOutletQuery.data?.data.length ?? 0) > 0 && (
          <NotificationBanner
            type="info"
            title="Tips"
            description="Bạn có thể tham gia ca làm việc sớm trước 60 phút!"
          />
        )}

        {workingShiftListByOutletQuery.isSuccess &&
          (workingShiftListByOutletQuery.data?.data.length ?? 0) === 0 && (
            <NotificationBanner
              type="warning"
              title="Nhàn rỗi"
              description="Địa điểm làm việc hiện tại không có ca làm việc nào..."
            />
          )}

        {upcomingShifts.length > 0 && (
          <div className="mb-8 mt-4 divide-y divide-gray-30">
            <StandOutWorkingShiftCard
              workingShift={upcomingShifts[0]}
              onClick={() => setSelectedWorkingShift(upcomingShifts[0])}
            />
          </div>
        )}
        {(workingShiftListByOutletQuery.data?.data.length ?? 0) > 0 && (
          <div className="mt-4 divide-y divide-gray-30">
            {workingShiftListByOutletQuery.data?.data.map((workingShift) => (
              <WorkingShiftCard
                key={workingShift.id}
                workingShift={workingShift}
                onClick={() => setSelectedWorkingShift(workingShift)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedWorkingShift}
        onClose={() => setSelectedWorkingShift(null)}
        title="Check in"
      >
        {selectedWorkingShift && (
          <CheckInConfirm
            workingShift={selectedWorkingShift}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </Modal>

      <ScreenFooter />
    </>
  );
};

const shiftStatusMapping = {
  notYetStarted: {
    dotColor: "bg-gray-40",
  },
  hasStarted: {
    dotColor: "bg-green-40",
  },
  hasEnded: {
    dotColor: "bg-red-40",
  },
};

interface StandOutWorkingShiftCardProps {
  workingShift: IWorkingShift;
  onClick: () => void;
}

const StandOutWorkingShiftCard = (props: StandOutWorkingShiftCardProps) => {
  const { workingShift, onClick } = props;

  const shiftStatus = useShiftStatus({
    startTime: new Date(workingShift.startTime),
    endTime: new Date(workingShift.endTime),
    threshold: { upcoming: 120, startingSoon: 60 },
  });

  const shiftTime = useShiftTime({
    startTime: new Date(workingShift.startTime),
    endTime: new Date(workingShift.endTime),
  });

  const shiftStatusMapped =
    shiftStatusMapping[
    shiftStatus.notYetStarted
      ? "notYetStarted"
      : shiftStatus.hasStarted
        ? "hasStarted"
        : "hasEnded"
    ];

  const isDisabled =
    !shiftStatus.isOngoing && (!shiftStatus.isStartingSoon || shiftStatus.hasEnded);

  const workingDurationFormated = useShiftDurationFormated({
    startTime: new Date(workingShift.startTime),
    endTime: new Date(workingShift.endTime),
  });

  const formatTimeDisplay = (time: { hours: number; minutes: number }) => {
    const hours = time.hours > 0 ? `${time.hours} giờ ` : "";
    const minutes = `${time.minutes} phút`;
    return `${hours}${minutes}`;
  };

  const getShiftTimeMessage = (status: typeof shiftStatus, time: typeof shiftTime) => {
    // If shift has ended, don't display anything
    if (status.hasEnded) return null;

    // Shift hasn't started and hasn't reached early check-in time
    if (!status.hasStarted && !status.isStartingSoon && time.timeUntilStart) {
      return `Sắp tới (sau ${formatTimeDisplay(time.timeUntilStart)})`;
    }

    // Shift is about to start (within early check-in time)
    if (!status.hasStarted && status.isStartingSoon && time.timeUntilStart) {
      return `Sắp diễn ra (sau ${formatTimeDisplay(time.timeUntilStart)})`;
    }

    // Shift is ongoing
    if (status.hasStarted && time.timeSinceStart) {
      return `Đang diễn ra (trong ${formatTimeDisplay(time.timeSinceStart)})`;
    }

    return null;
  };

  return (
    <div className="bg-white p-4">
      {/* Status & Name */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center justify-start">
          <div className={StyleUtil.cn("h-2 w-2 shrink-0", shiftStatusMapped.dotColor)} />
          <p className="ml-2 line-clamp-1 text-sm font-medium">{workingShift.name}</p>
        </div>
      </div>

      {/* Location & Time */}
      <div className="my-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Icons.Location className="h-4 w-4 text-gray-70" />
            <p className="ml-2 line-clamp-1 text-xs text-gray-70">
              {workingShift.outlet.name} <span className="px-1">•</span>
              {workingShift.outlet.address}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="line-clamp-1 text-base font-medium">
            <span>{moment(workingShift.startTime).format("HH:mm A")}</span>
            <span> → </span>
            <span>{moment(workingShift.endTime).format("HH:mm A")}</span>
          </p>

          <p className="line-clamp-1 text-sm text-gray-50">{workingDurationFormated}</p>
        </div>
      </div>

      {/* Join Button */}
      <div>
        <Button
          variant={isDisabled ? "secondary" : "primary"}
          size="medium"
          centered
          icon={Icons.ArrowRight}
          className="w-full"
          onClick={onClick}
          disabled={isDisabled}
        >
          Tham gia
        </Button>

        {!shiftStatus.hasEnded && (
          <p className="mt-2 text-center text-xs text-gray-50">
            {getShiftTimeMessage(shiftStatus, shiftTime)}
          </p>
        )}
      </div>
    </div>
  );
};

interface WorkingShiftCardProps {
  workingShift: IWorkingShift;
  onClick: () => void;
}

const WorkingShiftCard = (props: WorkingShiftCardProps) => {
  const { workingShift, onClick } = props;

  const shiftStatus = useShiftStatus({
    startTime: new Date(workingShift.startTime),
    endTime: new Date(workingShift.endTime),
    threshold: { upcoming: 120, startingSoon: 60 },
  });

  const shiftStatusMapped =
    shiftStatusMapping[
    shiftStatus.notYetStarted
      ? "notYetStarted"
      : shiftStatus.hasStarted
        ? "hasStarted"
        : "hasEnded"
    ];

  const isDisabled =
    !shiftStatus.isOngoing && (!shiftStatus.isStartingSoon || shiftStatus.hasEnded);

  const workingDurationFormated = useShiftDurationFormated({
    startTime: new Date(workingShift.startTime),
    endTime: new Date(workingShift.endTime),
  });

  const shiftDateFormated = () => {
    const startMoment = moment(workingShift.startTime);
    const endMoment = moment(workingShift.endTime);
    const isSameDay = startMoment.isSame(endMoment, "day");

    if (isSameDay) {
      return `${StringUtil.toTitleCase(startMoment.format("dddd, "))}${startMoment.format("DD/MM/YYYY")}`;
    }

    return `${StringUtil.toTitleCase(startMoment.format("dddd, "))}${startMoment.format("DD/MM/YYYY")} - ${StringUtil.toTitleCase(endMoment.format("dddd, "))}${endMoment.format("DD/MM/YYYY")}`;
  };

  return (
    <div className="bg-white p-4">
      {/* Status & Name */}
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center justify-start">
          <div className={StyleUtil.cn("h-2 w-2 shrink-0", shiftStatusMapped.dotColor)} />
          <p className="ml-2 line-clamp-1 text-sm font-medium">{workingShift.name}</p>
        </div>

        <p className="text-xs">
          <span>{moment(workingShift.startTime).format("HH:mm A")}</span>
          <span> → </span>
          <span>{moment(workingShift.endTime).format("HH:mm A")}</span>
        </p>
      </div>

      {/* Time & Duration */}
      <div className="flex items-center justify-between gap-4">
        <p className="line-clamp-1 text-xs text-gray-50">{shiftDateFormated()}</p>
        <p className="line-clamp-1 text-xs text-gray-50">{workingDurationFormated}</p>
      </div>

      {/* Location & Join Button */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center justify-start">
          <Icons.Location className="h-4 w-4 text-gray-70" />
          <p className="ml-2 text-xs text-gray-70">{workingShift.outlet.name}</p>
        </div>

        <Button
          variant={isDisabled ? "secondary" : "primary"}
          size="small"
          icon={Icons.ArrowRight}
          disabled={isDisabled}
          onClick={onClick}
        >
          Tham gia
        </Button>
      </div>
    </div>
  );
};
