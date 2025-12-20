import moment from "moment";
import React from "react";

export const useShiftDurationFormated = (props: { startTime: Date; endTime: Date }) => {
  const { startTime, endTime } = props;

  const workingDuration = React.useMemo(() => {
    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    const formatDuration = (hours: number, minutes: number) => {
      const hourText = hours > 0 ? `${hours} giờ` : "";
      const minuteText = minutes > 0 ? `${minutes} phút` : "";

      if (hourText && minuteText) {
        return `${hourText} ${minuteText}`;
      }

      return hourText || minuteText || "--";
    };

    return formatDuration(hours, minutes);
  }, [startTime, endTime]);

  return workingDuration;
};
