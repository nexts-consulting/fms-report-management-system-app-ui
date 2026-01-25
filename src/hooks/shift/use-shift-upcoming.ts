import moment from "moment";
import React from "react";
import { useTick } from "../../kits/hooks/use-tick";
import { IWorkingShiftLocation } from "@/types/model";

export const useShiftUpcoming = (shifts: IWorkingShiftLocation[]) => {
  const [now, controls] = useTick({ unit: "minute" });

  const upcomingShiftsRealtime = React.useMemo(() => {
    const upcomingShifts = shifts
      .map((shift) => ({
        ...shift,
        startLocal: new Date(shift.start_time),
        endLocal: new Date(shift.end_time),
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
