import moment from "moment";
import React from "react";
import { useTick } from "../../kits/hooks/use-tick";

export const useShiftStatus = (props: {
  startTime: Date;
  endTime: Date;
  threshold: {
    upcoming: number; // minutes before startTime considered as upcoming
    startingSoon: number; // minutes before startTime considered as starting soon
  };
}) => {
  const { startTime, endTime, threshold } = props;
  const [now, controls] = useTick({ unit: "minute" });

  // Base Status
  const notYetStarted = React.useMemo(() => {
    return now.isBefore(moment(startTime));
  }, [now, startTime]);

  const hasStarted = React.useMemo(() => {
    return now.isAfter(moment(startTime)) && now.isBefore(moment(endTime));
  }, [now, startTime, endTime]);

  const hasEnded = React.useMemo(() => {
    return now.isAfter(moment(endTime));
  }, [now, endTime]);

  // Proximity Status
  const isUpcoming = React.useMemo(() => {
    const diffInMinutes = moment(startTime).diff(now, "minutes");
    return diffInMinutes <= threshold.upcoming && diffInMinutes > threshold.startingSoon;
  }, [now, startTime, threshold.upcoming, threshold.startingSoon]);

  const isStartingSoon = React.useMemo(() => {
    const diffInMinutes = moment(startTime).diff(now, "minutes");
    return diffInMinutes <= threshold.startingSoon && diffInMinutes > 0;
  }, [now, startTime, threshold.startingSoon]);

  const isOngoing = React.useMemo(() => {
    return hasStarted;
  }, [hasStarted]);

  React.useEffect(() => {
    if (hasEnded) {
      controls.off();
    } else {
      controls.on();
    }

    return () => {
      controls.off();
    };
  }, [controls, hasEnded]);

  return {
    notYetStarted,
    hasStarted,
    hasEnded,
    isUpcoming,
    isStartingSoon,
    isOngoing,
  };
};
