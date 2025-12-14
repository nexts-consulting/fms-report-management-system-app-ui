import { IWorkingShift } from "@/types/model";
import moment from "moment";
import React from "react";
import { useTick } from "../kits/hooks/use-tick";

export const useShiftUpcoming = (shifts: IWorkingShift[]) => {
  const [now, controls] = useTick({ unit: "minute" });

  const upcomingShiftsRealtime = React.useMemo(() => {
    const upcomingShifts = shifts
      .map((shift) => ({
        ...shift,
        startLocal: new Date(shift.startTime),
        endLocal: new Date(shift.endTime),
      }))
      .filter((shift) => {
        const startLocal = moment(shift.startLocal);
        const endLocal = moment(shift.endLocal);
        const threshold = startLocal.clone().add(60, "minutes");

        const notStarted = now.isBefore(startLocal);
        const startedButRecent =
          now.isAfter(startLocal) && now.isBefore(endLocal) && now.isBefore(threshold);

        return notStarted || startedButRecent;
      })
      .sort((a, b) => moment(a.startLocal).diff(moment(b.startLocal)));

    return upcomingShifts;
  }, [now, shifts]);

  React.useEffect(() => {
    return () => {
      controls.off();
    };
  }, []);

  return upcomingShiftsRealtime;
};
