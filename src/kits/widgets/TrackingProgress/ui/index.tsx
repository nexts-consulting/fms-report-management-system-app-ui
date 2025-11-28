import React from "react";
import { constants } from "../constants";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import moment from "moment";
import { css } from "@emotion/css";
import { StyleUtil } from "@/kits/utils/style.util";
import { useTick } from "@/kits/hooks/use-tick";
import "react-circular-progressbar/dist/styles.css";

export interface RootProps {
  startTime: Date;
  endTime: Date;
  startTrackingTime?: Date;
  freezeOnEnd?: boolean;
}

export const Root = React.memo((props: RootProps) => {
  const { startTime, endTime, startTrackingTime, freezeOnEnd = false } = props;

  const [now, controls] = useTick({ unit: "second" });

  const { percentage, elapsedTime, isEnded, isNotStarted } = React.useMemo(() => {
    const shiftStart = moment(startTime);
    const shiftEnd = moment(endTime);
    const trackingStart = startTrackingTime ? moment(startTrackingTime) : shiftStart;

    const isEnded = now.isAfter(shiftEnd);
    const isNotStarted = now.isBefore(trackingStart);

    // If not started yet, return 0%
    if (isNotStarted) {
      return {
        percentage: 0,
        elapsedTime: "00:00:00",
        isEnded: false,
        isNotStarted: true,
      };
    }

    // Calculate elapsed time from tracking start
    const elapsed = isEnded && freezeOnEnd ? shiftEnd.diff(trackingStart) : now.diff(trackingStart);

    // Calculate elapsed time (freeze at end time if ended)
    const duration = moment.duration(elapsed);
    const timeText = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");

    // Calculate percentage based on shift start and end time
    const currentTime = isEnded && freezeOnEnd ? shiftEnd : moment(now);
    const totalShiftDuration = shiftEnd.diff(shiftStart);
    const elapsedShiftTime = currentTime.diff(shiftStart);
    const percent = Math.min(Math.round((elapsedShiftTime / totalShiftDuration) * 100), 100);

    return {
      percentage: percent,
      elapsedTime: timeText,
      isEnded,
      isNotStarted: false,
    };
  }, [startTime, endTime, startTrackingTime, now, freezeOnEnd]);

  React.useEffect(() => {
    return () => {
      controls.off();
    };
  }, []);

  return (
    <div className="bg-white py-6">
      <div
        className={StyleUtil.cn(
          "mx-auto",
          css`
            .CircularProgressbar-text {
              font-weight: 500;
            }
          `,
        )}
        style={{ height: 160, width: 160 }}
      >
        <CircularProgressbar
          value={percentage}
          text={elapsedTime}
          strokeWidth={8}
          styles={buildStyles({
            strokeLinecap: "round",
            textSize: "14px",
            pathTransitionDuration: 0.5,
            pathColor: isEnded ? "#42be65" : isNotStarted ? "#e0e0e0" : "#4589ff",
            textColor: "#4d5358",
            trailColor: "#e0e0e0",
            backgroundColor: "#ffffff",
          })}
        />
      </div>
    </div>
  );
});

Root.displayName = constants.INSTANCE_NAME;
