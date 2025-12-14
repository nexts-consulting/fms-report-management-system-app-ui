import { ExtractFnReturnType } from "@/libs/react-query";
import { QueryConfig } from "@/libs/react-query";
import { IWorkingShift, ILocation as ILocationModel } from "@/types/model";
import { useQuery } from "react-query";
import {
  httpRequestGetLocationWorkshiftsByDateRange,
} from "@/services/application/management/work-shifts";
import { ILocation } from "@/services/application/management/master-data/locations-fms";
import dayjs from "dayjs";
import { ILocationWorkshift } from "@/services/application/management/work-shifts/types";

type HttpRequestWorkingShiftListByLocationToday = {
  projectCode: string;
  locationId: number;
  location?: ILocation; // Pass location if available to avoid extra fetch
};

type WorkingShiftListByLocationTodayResponseData = {
  data: IWorkingShift[];
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
 * Map ILocationWorkshift to IWorkingShift
 */
const mapLocationWorkshiftToWorkingShift = (
  locationWorkshift: ILocationWorkshift,
  location: ILocation,
): IWorkingShift => {
  const locationModel = mapLocationToModel(location);
  
  return {
    id: locationWorkshift.workshift_id,
    name: locationWorkshift.workshift_name || "Ca làm việc",
    startTime: locationWorkshift.workshift_start_time || "",
    endTime: locationWorkshift.workshift_end_time || "",
    location: locationModel,
  };
};

const httpRequestWorkingShiftListByLocationToday = async (
  params: HttpRequestWorkingShiftListByLocationToday,
): Promise<WorkingShiftListByLocationTodayResponseData> => {
  try {
    // Get today's date range
    const today = dayjs().startOf("day");
    const startDate = today.format("YYYY-MM-DD HH:mm:ss");
    const endDate = today.endOf("day").format("YYYY-MM-DD HH:mm:ss");

    // Get location workshifts for today
    const locationWorkshifts = await httpRequestGetLocationWorkshiftsByDateRange(
      params.projectCode,
      startDate,
      endDate,
    );

    // Filter by location_id
    const filtered = locationWorkshifts.filter(
      (lw: ILocationWorkshift) => lw.location_id === params.locationId,
    );

    // Use provided location or construct from joined data
    const location: ILocation = params.location || {
      id: params.locationId,
      project_code: params.projectCode,
      code: filtered[0]?.location_code || "",
      name: filtered[0]?.location_name || "",
      address: filtered[0]?.location_address || null,
      latitude: filtered[0]?.location_latitude || null,
      longitude: filtered[0]?.location_longitude || null,
      checkin_radius_meters: filtered[0]?.location_checkin_radius_meters || 100,
      admin_division_id: filtered[0]?.location_admin_division_id || null,
      metadata: filtered[0]?.location_metadata || {},
      created_at: filtered[0]?.location_created_at || "",
      updated_at: filtered[0]?.location_updated_at || "",
    };

    // If no location data found, return empty array
    if (!location.name && filtered.length === 0) {
      return { data: [] };
    }

    // Map to IWorkingShift format
    const data = filtered.map((lw) =>
      mapLocationWorkshiftToWorkingShift(lw, location),
    );

    return { data };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestWorkingShiftListByLocationToday;

type QueryOptions = {
  params: HttpRequestWorkingShiftListByLocationToday;
  config?: QueryConfig<QueryFnType>;
};

const useQueryWorkingShiftListByLocationToday = ({
  params,
  config,
}: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/working-shift/list-by-location-today", params],
    queryFn: () => httpRequestWorkingShiftListByLocationToday(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export {
  httpRequestWorkingShiftListByLocationToday,
  useQueryWorkingShiftListByLocationToday,
};
export type { WorkingShiftListByLocationTodayResponseData };

