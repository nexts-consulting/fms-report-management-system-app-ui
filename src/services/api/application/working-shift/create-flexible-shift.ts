import { IWorkingShiftLocation, ILocation as ILocationModel } from "@/types/model";
import { ILocation } from "@/types/model";
import dayjs from "dayjs";

type CreateFlexibleWorkingShiftParams = {
  location: ILocation;
};

/**
 * Create a flexible working shift for today
 */
export const createFlexibleWorkingShift = 
(params: CreateFlexibleWorkingShiftParams): IWorkingShiftLocation => {
  const today = dayjs().startOf("day").add(5, "minute");
  const endOfDay = dayjs().startOf("day").add(23, "hour").add(55, "minute");
  return {
    id: 0,
    name: "Ca làm linh hoạt",
    start_time: today.toISOString(),
    end_time: endOfDay.toISOString(),
    location: params.location,
  };
}