import moment from "moment";
import React from "react";

export const useShiftDuration = (props: { startTime: Date; endTime: Date }) => {
  const { startTime, endTime } = props;

  const workingDuration = React.useMemo(() => {
    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return {
      hours,
      minutes,
    };
  }, [startTime, endTime]);

  return workingDuration;
};
