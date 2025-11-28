import React, { useMemo } from "react";
import moment from "moment";
import { useTick } from "./use-tick";

interface UseLockTimerProps {
  startTime: Date;
  lockAfterHours?: number;
}

export const useLockTimer = ({ startTime, lockAfterHours = 1 }: UseLockTimerProps) => {
  const [currentTime, controls] = useTick({ unit: "minute" });

  const { start, lockTime } = useMemo(
    () => ({
      start: moment(startTime),
      lockTime: moment(startTime).add(lockAfterHours, "hours"),
    }),
    [startTime, lockAfterHours],
  );

  const timer = useMemo(() => {
    // If current time is after lock time, feature is locked
    if (currentTime.isAfter(lockTime)) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isLocked: true,
        remainingMs: 0,
      };
    }

    // If current time is before start time, show full duration
    if (currentTime.isBefore(start)) {
      const duration = moment.duration(lockAfterHours, "hours");
      return {
        hours: Math.floor(duration.asHours()),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
        isLocked: false,
        remainingMs: duration.asMilliseconds(),
      };
    }

    // Calculate remaining time
    const remaining = moment.duration(lockTime.diff(currentTime));
    return {
      hours: Math.floor(remaining.asHours()),
      minutes: remaining.minutes(),
      seconds: remaining.seconds(),
      isLocked: false,
      remainingMs: remaining.asMilliseconds(),
    };
  }, [currentTime, start, lockTime, lockAfterHours]);

  React.useEffect(() => {
    return () => {
      controls.off();
    };
  }, []);

  return timer;
};
