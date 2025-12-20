import { IProjectWorkshiftConfig, ILocation, IWorkingShiftLocation } from "@/types/model";
import dayjs from "dayjs";

type CreateWorkingShiftFromDefaultProjectTimeParams = {
  projectCode: string;
  config: IProjectWorkshiftConfig;
  location: ILocation;
};


/**
 * Create a working shift from default project time for today
 */

export const createWorkingShiftFromDefaultProjectTime = 
(params: CreateWorkingShiftFromDefaultProjectTimeParams): IWorkingShiftLocation => {
    // Check if default times are configured
    if (!params.config.default_start_time || !params.config.default_end_time) {
      throw new Error("Default times are not configured");
    }
  
    // Get today's date
    const today = dayjs().startOf("day");
  
    // Parse default times (format: HH:mm:ss)
    const [startHour, startMinute] = params.config.default_start_time.split(":").map(Number);
    const [endHour, endMinute] = params.config.default_end_time.split(":").map(Number);
  
    // Create start and end times for today
    const startTime = today.hour(startHour).minute(startMinute).second(0);
    let endTime = today.hour(endHour).minute(endMinute).second(0);
  
    // If end time is before start time, assume it's next day
    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, "day");
    }
  
  return {
    id: 0,
    name: "Ca làm mặc định",
    start_time: today.toISOString(),
    end_time: endTime.toISOString(),
    location: params.location,
  };
}