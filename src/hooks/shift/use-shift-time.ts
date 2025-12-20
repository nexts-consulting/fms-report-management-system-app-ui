import moment from "moment";
import React from "react";
import { useTick } from "../../kits/hooks/use-tick";

export const useShiftTime = (props: { startTime: Date; endTime: Date }) => {
  const { startTime, endTime } = props;
  const [now, controls] = useTick({ unit: "minute" });

  const hasStarted = React.useMemo(() => {
    return now.isAfter(moment(startTime));
  }, [now, startTime]);

  const hasEnded = React.useMemo(() => {
    return now.isAfter(moment(endTime));
  }, [now, endTime]);

  const timeUntilStart = React.useMemo(() => {
    if (!hasStarted) {
      const duration = moment.duration(moment(startTime).diff(now));
      return {
        minutes: duration.minutes(),
        hours: duration.hours(),
        asMinutes: duration.asMinutes(),
      };
    }
    return null;
  }, [hasStarted, now, startTime]);

  const timeSinceStart = React.useMemo(() => {
    if (hasStarted && !hasEnded) {
      const duration = moment.duration(now.diff(moment(startTime)));
      return {
        minutes: duration.minutes(),
        hours: duration.hours(),
        asMinutes: duration.asMinutes(),
      };
    }
    return null;
  }, [hasStarted, hasEnded, now, startTime]);

  React.useEffect(() => {
    return () => {
      controls.off();
    };
  }, []);

  return {
    timeUntilStart,
    timeSinceStart,
    hasStarted,
    hasEnded,
  };
};
