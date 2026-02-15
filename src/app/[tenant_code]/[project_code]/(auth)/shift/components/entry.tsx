"use client";

import { CheckInConfirm } from "@/components/CheckInConfirm";
import { ScreenFooter } from "@/components/ScreenFooter";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { useProjectConfigs } from "@/hooks/project/use-project-configs";
import { useShiftDurationFormated } from "@/hooks/shift/use-shift-duration-formated";
import { useShiftStatus } from "@/hooks/shift/use-shift-status";
import { useShiftTime } from "@/hooks/shift/use-shift-time";
import { useShiftUpcoming } from "@/hooks/shift/use-shift-upcoming";
import { useCheckinTimeAllowed } from "@/hooks/check-in/use-checkin-time-allowed";
import { Button } from "@/kits/components/button";
import { Icons } from "@/kits/components/icons";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { Modal } from "@/kits/components/modal";
import { useNotification } from "@/kits/components/notification";
import { NotificationBanner } from "@/kits/components/notification-banner";
import { StringUtil, StyleUtil } from "@/kits/utils";
import { useQueryWorkingShiftListByLocationToday } from "@/services/api/application/working-shift/list-by-location-today";
import { useQueryWorkingShiftListByUserToday } from "@/services/api/application/working-shift/list-by-user-today";
import { createWorkingShiftFromDefaultProjectTime } from "@/services/api/application/working-shift/create-from-default-project-time";

import { IProjectWorkshiftConfig, IWorkingShiftLocation } from "@/types/model";
import moment from "moment";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { createFlexibleWorkingShift } from "@/services/api/application/working-shift/create-flexible-shift";

export const Entry = () => {
  const globalStore = useGlobalContext();
  const selectedLocation = globalStore.use.selectedLocation();

  const authStore = useAuthContext();
  const user = authStore.use.user();
  const project = authStore.use.project();

  // Use useProjectConfigs hook to ensure configs are loaded
  const { projectWorkshiftConfig, isLoading: isLoadingConfigs } = useProjectConfigs();

  const router = useRouter();
  const params = useParams();
  const { buildPath } = useTenantProjectPath();

  const projectCode = (params?.project_code as string) || project?.code || "";
  const username = user?.username || "";

  const notification = useNotification();

  const [selectedWorkingShift, setSelectedWorkingShift] =
    React.useState<IWorkingShiftLocation | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [workshiftList, setWorkshiftList] = React.useState<IWorkingShiftLocation[]>([]);
  const [isLoadingWorkshifts, setIsLoadingWorkshifts] = React.useState(false);

  // Query for FIXED_TIME_WITHIN_WORKSHIFT mode
  const locationWorkshiftsQuery = useQueryWorkingShiftListByLocationToday({
    params: {
      projectCode,
      locationId: selectedLocation?.id ?? 0,
      location: selectedLocation || undefined,
    },
    config: {
      enabled:
        !!projectWorkshiftConfig &&
        projectWorkshiftConfig.mode === "FIXED_TIME_WITHIN_WORKSHIFT" &&
        !!selectedLocation &&
        !!projectCode,
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

  // Query for FIXED_TIME_WITH_ASSIGNED mode
  const userWorkshiftsQuery = useQueryWorkingShiftListByUserToday({
    params: {
      projectCode,
      username,
    },
    config: {
      enabled:
        !!projectWorkshiftConfig &&
        projectWorkshiftConfig.mode === "FIXED_TIME_WITH_ASSIGNED" &&
        !!username &&
        !!projectCode,
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

  // Load workshifts based on config mode
  React.useEffect(() => {
    const loadWorkshifts = async () => {
      // Wait for config to be loaded
      if (projectWorkshiftConfig === undefined) {
        // Config is still loading, don't do anything yet
        return;
      }

      // Config is explicitly null (not loaded or error)
      if (projectWorkshiftConfig === null) {
        setWorkshiftList([]);
        setIsLoadingWorkshifts(false);
        return;
      }

      setIsLoadingWorkshifts(true);

      try {
        let shifts: IWorkingShiftLocation[] = [];

        switch (projectWorkshiftConfig.mode) {
          case "FIXED_TIME_WITHIN_WORKSHIFT":
            // Load from location workshifts query
            // Wait for query to complete if it's enabled
            if (
              !!projectWorkshiftConfig &&
              projectWorkshiftConfig.mode === "FIXED_TIME_WITHIN_WORKSHIFT" &&
              !!selectedLocation &&
              !!projectCode
            ) {
              if (locationWorkshiftsQuery.data?.data) {
                shifts = locationWorkshiftsQuery.data.data;
              } else if (
                !locationWorkshiftsQuery.isLoading &&
                !locationWorkshiftsQuery.isFetching
              ) {
                // Query completed but no data
                shifts = [];
              } else {
                // Still loading, don't update yet
                return;
              }
            }
            break;

          case "FIXED_TIME_WITH_ASSIGNED":
            // Load from user workshifts query
            // Wait for query to complete if it's enabled
            if (
              !!projectWorkshiftConfig &&
              projectWorkshiftConfig.mode === "FIXED_TIME_WITH_ASSIGNED" &&
              !!username &&
              !!projectCode
            ) {
              if (userWorkshiftsQuery.data?.data) {
                shifts = userWorkshiftsQuery.data.data;
              } else if (!userWorkshiftsQuery.isLoading && !userWorkshiftsQuery.isFetching) {
                // Query completed but no data
                shifts = [];
              } else {
                // Still loading, don't update yet
                return;
              }
            }
            break;

          case "FIXED_TIME_BY_DEFAULT_TIME":
            // Create workshift from default time config
            if (selectedLocation) {
              const shift = createWorkingShiftFromDefaultProjectTime({
                projectCode,
                config: projectWorkshiftConfig,
                location: selectedLocation,
              });
              if (shift) {
                shifts = [shift];
              }
            }
            break;

          case "FLEXIBLE_TIME":
            // Create flexible workshift (00:00 to 23:59:59 today)
            if (selectedLocation) {
              const shift = createFlexibleWorkingShift({
                location: selectedLocation,
              });
              shifts = [shift];
            }
            break;

          default:
            console.warn("Unknown workshift mode:", projectWorkshiftConfig.mode);
            shifts = [];
        }

        setWorkshiftList(shifts);
      } catch (error) {
        console.error("Error loading workshifts:", error);
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách ca làm việc",
          options: {
            duration: 5000,
          },
        });
        setWorkshiftList([]);
      } finally {
        setIsLoadingWorkshifts(false);
      }
    };

    loadWorkshifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectWorkshiftConfig,
    locationWorkshiftsQuery.data,
    locationWorkshiftsQuery.isLoading,
    locationWorkshiftsQuery.isFetching,
    userWorkshiftsQuery.data,
    userWorkshiftsQuery.isLoading,
    userWorkshiftsQuery.isFetching,
    selectedLocation,
    projectCode,
    username,
  ]);

  // Determine loading state
  const isLoading =
    projectWorkshiftConfig === undefined || // Config is still loading
    isLoadingWorkshifts ||
    (projectWorkshiftConfig?.mode === "FIXED_TIME_WITHIN_WORKSHIFT" &&
      (locationWorkshiftsQuery.isLoading || locationWorkshiftsQuery.isFetching)) ||
    (projectWorkshiftConfig?.mode === "FIXED_TIME_WITH_ASSIGNED" &&
      (userWorkshiftsQuery.isLoading || userWorkshiftsQuery.isFetching));

  const upcomingShifts = useShiftUpcoming(workshiftList);

  const handleConfirm = React.useCallback(() => {
    globalStore.setState({
      selectedWorkingShift: selectedWorkingShift,
    });

    setConfirmLoading(true);

    setTimeout(() => {
      setConfirmLoading(false);
      router.push(buildPath("/checkin"));
    }, 1000);
  }, [selectedWorkingShift]);

  const handleCancel = React.useCallback(() => {
    setSelectedWorkingShift(null);
  }, []);

  return (
    <>
      <LoadingOverlay active={confirmLoading} />

      <ScreenHeader title="Ca làm việc" loading={isLoading} onBack={() => router.back()} />

      <div className="px-4 pt-6">
        {projectWorkshiftConfig === null && (
          <NotificationBanner
            type="warning"
            title="Cảnh báo"
            description="Không thể tải cấu hình ca làm việc. Vui lòng thử lại sau."
          />
        )}

        {projectWorkshiftConfig &&
          projectWorkshiftConfig !== null &&
          !isLoading &&
          workshiftList.length === 0 &&
          projectWorkshiftConfig.mode !== "FLEXIBLE_TIME" && (
            <NotificationBanner
              type="warning"
              title="Nhàn rỗi"
              description={
                projectWorkshiftConfig.mode === "FIXED_TIME_WITHIN_WORKSHIFT"
                  ? "Địa điểm làm việc hiện tại không có ca làm việc nào..."
                  : projectWorkshiftConfig.mode === "FIXED_TIME_WITH_ASSIGNED"
                    ? "Bạn không có ca làm việc nào được gán trong ngày hôm nay..."
                    : "Không có ca làm việc nào trong ngày hôm nay..."
              }
            />
          )}

        {upcomingShifts.length > 0 && (
          <div className="mt-4 divide-y divide-gray-30">
            <StandOutWorkingShiftCard
              workingShift={upcomingShifts[0]}
              config={projectWorkshiftConfig}
              onClick={() => setSelectedWorkingShift(upcomingShifts[0])}
            />
          </div>
        )}

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-gray-30" />
          <span className="mx-4 text-sm font-medium text-gray-60">Tất cả ca làm</span>
          <div className="flex-1 border-t border-gray-30" />
        </div>

        {workshiftList.length > 0 && (
          <div className="mt-4 divide-y divide-gray-30">
            {workshiftList.map((workingShift, index) => (
              <WorkingShiftCard
                key={workingShift.id || `workshift-${index}`}
                workingShift={workingShift}
                config={projectWorkshiftConfig}
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
            workingShiftLocation={selectedWorkingShift}
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
  workingShift: IWorkingShiftLocation;
  config: IProjectWorkshiftConfig | null | undefined;
  onClick: () => void;
}

const StandOutWorkingShiftCard = (props: StandOutWorkingShiftCardProps) => {
  const { workingShift, config, onClick } = props;

  const shiftStatus = useShiftStatus({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
    threshold: { upcoming: 120, startingSoon: 60 },
  });

  const shiftTime = useShiftTime({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
  });

  const checkinTimeAllowed = useCheckinTimeAllowed({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
    config,
  });

  const shiftStatusMapped =
    shiftStatusMapping[
      shiftStatus.notYetStarted
        ? "notYetStarted"
        : shiftStatus.hasStarted
          ? "hasStarted"
          : "hasEnded"
    ];

  // Check if button should be disabled based on check-in time restrictions
  const isDisabled = !checkinTimeAllowed.isAllowed;

  const workingDurationFormated = useShiftDurationFormated({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
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
              {workingShift.location.name} <span className="px-1">•</span>
              {workingShift.location.address}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="line-clamp-1 text-base font-medium">
            <span>{moment(workingShift.start_time).format("HH:mm A")}</span>
            <span> → </span>
            <span>{moment(workingShift.end_time).format("HH:mm A")}</span>
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

        {(checkinTimeAllowed.reason ||
          (!shiftStatus.hasEnded && getShiftTimeMessage(shiftStatus, shiftTime))) && (
          <p
            className={StyleUtil.cn(
              "mt-2 text-xs",
              checkinTimeAllowed.reason ? "text-red-50" : "text-gray-50",
            )}
          >
            {checkinTimeAllowed.reason || getShiftTimeMessage(shiftStatus, shiftTime)}
          </p>
        )}
      </div>
    </div>
  );
};

interface WorkingShiftCardProps {
  workingShift: IWorkingShiftLocation;
  config: IProjectWorkshiftConfig | null | undefined;
  onClick: () => void;
}

const WorkingShiftCard = (props: WorkingShiftCardProps) => {
  const { workingShift, config, onClick } = props;

  const shiftStatus = useShiftStatus({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
    threshold: { upcoming: 120, startingSoon: 60 },
  });

  const checkinTimeAllowed = useCheckinTimeAllowed({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
    config,
  });

  const shiftStatusMapped =
    shiftStatusMapping[
      shiftStatus.notYetStarted
        ? "notYetStarted"
        : shiftStatus.hasStarted
          ? "hasStarted"
          : "hasEnded"
    ];

  // Check if button should be disabled based on check-in time restrictions
  const isDisabled = !checkinTimeAllowed.isAllowed;

  const workingDurationFormated = useShiftDurationFormated({
    startTime: new Date(workingShift.start_time),
    endTime: new Date(workingShift.end_time),
  });

  const shiftDateFormated = () => {
    const startMoment = moment(workingShift.start_time);
    const endMoment = moment(workingShift.end_time);
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
          <span>{moment(workingShift.start_time).format("HH:mm A")}</span>
          <span> → </span>
          <span>{moment(workingShift.end_time).format("HH:mm A")}</span>
        </p>
      </div>

      {/* Time & Duration */}
      <div className="flex items-center justify-between gap-4">
        <p className="line-clamp-1 text-xs text-gray-50">{shiftDateFormated()}</p>
        <p className="line-clamp-1 text-xs text-gray-50">{workingDurationFormated}</p>
      </div>
      {checkinTimeAllowed.reason && (
        <p className="mt-2 text-xs text-red-50">{checkinTimeAllowed.reason}</p>
      )}
      {/* Location & Join Button */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Icons.Location className="h-4 w-4 text-gray-70" />
            <p className="ml-2 text-xs text-gray-70">{workingShift.location.name}</p>
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
    </div>
  );
};
