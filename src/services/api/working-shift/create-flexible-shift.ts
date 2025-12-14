import { IWorkingShift, ILocation as ILocationModel } from "@/types/model";
import { ILocation } from "@/services/application/management/master-data/locations-fms";
import dayjs from "dayjs";

type CreateFlexibleWorkingShiftParams = {
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
 * Create a flexible working shift from 00:00 today to 23:59:59 today
 */
export const createFlexibleWorkingShift = (
  params: CreateFlexibleWorkingShiftParams,
): IWorkingShift => {
  const { location } = params;

  // Get today's date range
  const today = dayjs().startOf("day");
  const endOfDay = today.endOf("day");

  const locationModel = mapLocationToModel(location);

  return {
    id: 0, // Virtual workshift, no real ID
    name: "Ca làm việc linh hoạt",
    startTime: today.toISOString(),
    endTime: endOfDay.toISOString(),
    location: locationModel,
  };
};

