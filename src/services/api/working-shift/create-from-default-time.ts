import { IWorkingShift, ILocation as ILocationModel } from "@/types/model";
import { IProjectWorkshiftConfig } from "@/services/application/management/projects/configs/types";
import { ILocation } from "@/services/application/management/master-data/locations-fms";
import dayjs from "dayjs";

type CreateWorkingShiftFromDefaultTimeParams = {
  projectCode: string;
  config: IProjectWorkshiftConfig;
  location: ILocation;
};

/**
 * Map ILocation from locations-fms to ILocationModel from model.ts
 */
const mapLocationToModel = (location: ILocation): ILocationModel => {
  return {
    id: location.id,
    code: location.code,
    name: location.name,
    address: location.address || "",
    latitude: location.latitude || 0,
    longitude: location.longitude || 0,
    checkinRadiusMeters: location.checkin_radius_meters,
    createdAt: location.created_at,
    updatedAt: location.updated_at,
    province: {
      id: 0,
      name: "",
    },
  };
};

/**
 * Create a working shift from default time config for today
 */
export const createWorkingShiftFromDefaultTime = (
  params: CreateWorkingShiftFromDefaultTimeParams,
): IWorkingShift | null => {
  const { config, location } = params;

  // Check if default times are configured
  if (!config.default_start_time || !config.default_end_time) {
    return null;
  }

  // Get today's date
  const today = dayjs().startOf("day");

  // Parse default times (format: HH:mm:ss)
  const [startHour, startMinute] = config.default_start_time.split(":").map(Number);
  const [endHour, endMinute] = config.default_end_time.split(":").map(Number);

  // Create start and end times for today
  const startTime = today.hour(startHour).minute(startMinute).second(0);
  let endTime = today.hour(endHour).minute(endMinute).second(0);

  // If end time is before start time, assume it's next day
  if (endTime.isBefore(startTime)) {
    endTime = endTime.add(1, "day");
  }

  const locationModel = mapLocationToModel(location);

  return {
    id: 0, // Virtual workshift, no real ID
    name: `Ca làm việc ${startTime.format("HH:mm")} - ${endTime.format("HH:mm")}`,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    location: locationModel,
  };
};

