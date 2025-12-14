import moment from "moment";
import React from "react";
import { useTick } from "../kits/hooks/use-tick";
import { IProjectWorkshiftConfig } from "@/services/application/management/projects/configs/types";

export interface UseCheckinTimeAllowedParams {
  startTime: Date;
  endTime: Date;
  config: IProjectWorkshiftConfig | null | undefined;
}

export interface CheckinTimeAllowedResult {
  isAllowed: boolean;
  reason?: string;
  allowedStartTime?: Date;
  allowedEndTime?: Date;
}

/**
 * Hook to check if current time is within allowed check-in time range
 * based on project workshift config
 */
export const useCheckinTimeAllowed = (
  params: UseCheckinTimeAllowedParams,
): CheckinTimeAllowedResult => {
  const { startTime, endTime, config } = params;
  const [now, controls] = useTick({ unit: "minute" });

  const result = React.useMemo<CheckinTimeAllowedResult>(() => {
    const nowMoment = moment(now);
    const startMoment = moment(startTime);
    const endMoment = moment(endTime);

    // If config is not loaded, allow check-in if shift hasn't ended
    if (!config) {
      const isAllowed = nowMoment.isBefore(endMoment);
      return {
        isAllowed,
        reason: isAllowed ? undefined : "Ca làm việc đã kết thúc",
      };
    }

    // If check-in time limit is disabled, allow check-in at any time
    if (!config.is_limit_checkin_time) {
      return {
        isAllowed: true,
        reason: undefined,
      };
    }

    // Calculate allowed check-in time range
    const minMinutesBefore = config.min_checkin_minutes_before ?? 0;
    const maxMinutesAfter = config.max_checkin_minutes_after ?? 0;

    const allowedStartTime = startMoment.clone().subtract(minMinutesBefore, "minutes");
    const allowedEndTime = startMoment.clone().add(maxMinutesAfter, "minutes");

    // Check if current time is within allowed range
    const isBeforeAllowedStart = nowMoment.isBefore(allowedStartTime);
    const isAfterAllowedEnd = nowMoment.isAfter(allowedEndTime);
    const isAllowed = !isBeforeAllowedStart && !isAfterAllowedEnd;

    let reason: string | undefined;
    if (isBeforeAllowedStart) {
      const minutesUntilAllowed = allowedStartTime.diff(nowMoment, "minutes");
      const hours = Math.floor(minutesUntilAllowed / 60);
      const minutes = minutesUntilAllowed % 60;
      if (hours > 0) {
        reason = `Có thể check-in sau ${hours} giờ ${minutes} phút`;
      } else {
        reason = `Có thể check-in sau ${minutes} phút`;
      }
    } else if (isAfterAllowedEnd) {
      const minutesSinceAllowed = nowMoment.diff(allowedEndTime, "minutes");
      const hours = Math.floor(minutesSinceAllowed / 60);
      const minutes = minutesSinceAllowed % 60;
      if (hours > 0) {
        reason = `Đã quá thời gian check-in ${hours} giờ ${minutes} phút`;
      } else {
        reason = `Đã quá thời gian check-in ${minutes} phút`;
      }
    }

    return {
      isAllowed,
      reason,
      allowedStartTime: allowedStartTime.toDate(),
      allowedEndTime: allowedEndTime.toDate(),
    };
  }, [now, startTime, endTime, config]);

  React.useEffect(() => {
    if (result.isAllowed) {
      controls.on();
    } else {
      controls.off();
    }

    return () => {
      controls.off();
    };
  }, [controls, result.isAllowed]);

  return result;
};

