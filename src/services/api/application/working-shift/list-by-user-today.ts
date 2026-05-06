import { IWorkingShiftLocation, ILocation as ILocationModel } from "@/types/model";
import {
  httpRequestGetUserWorkshiftsByDateRange,
} from "@/services/api/application/working-shift";
import dayjs from "dayjs";
import { IUserWorkshift } from "@/types/model";
import { useQuery } from "react-query";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";

export type HttpRequestWorkingShiftListByUserToday = {
  projectCode: string;
  username: string;
};

export type WorkingShiftListByUserTodayResponseData = {
  data: IWorkingShiftLocation[];
};

/**
 * Map IUserWorkshift to IWorkingShift
 */
const mapUserWorkshiftToWorkingShift = (
  userWorkshift: IUserWorkshift,
): IWorkingShiftLocation => {
  const location: ILocationModel = {
    id: userWorkshift.location_id,
    project_code: userWorkshift.project_code,
    code: userWorkshift.location_code || "",
    name: userWorkshift.location_name || "Địa điểm chưa xác định",
    address: userWorkshift.location_address || "",
    latitude: userWorkshift.location_latitude ?? 0,
    longitude: userWorkshift.location_longitude ?? 0,
    checkin_radius_meters: userWorkshift.location_checkin_radius_meters ?? 100,
    created_at: userWorkshift.created_at,
    updated_at: userWorkshift.updated_at,
    admin_division_id: userWorkshift.location_admin_division_id ?? null,
    metadata: userWorkshift.location_metadata || {},
  };

  return {
    id: userWorkshift.workshift_id,
    name: userWorkshift.workshift_name || "Ca làm việc",
    start_time: userWorkshift.workshift_start_time || "",
    end_time: userWorkshift.workshift_end_time || "",
    location,
  };
};

export const httpRequestWorkingShiftListByUserToday = async (
  params: HttpRequestWorkingShiftListByUserToday,
): Promise<WorkingShiftListByUserTodayResponseData> => {
  try {
    // Get today's date range
    const today = dayjs().startOf("day");
    const startDate = today.format("YYYY-MM-DD HH:mm:ss");
    const endDate = today.endOf("day").format("YYYY-MM-DD HH:mm:ss");

    // Get user workshifts for today
    const userWorkshifts = await httpRequestGetUserWorkshiftsByDateRange(
      params.projectCode,
      startDate,
      endDate,
      params.username,
    );

    // Map to IWorkingShift format
    const data = userWorkshifts.map((uw) => mapUserWorkshiftToWorkingShift(uw));

    return { data };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestWorkingShiftListByUserToday;

type QueryOptions = {
  params: HttpRequestWorkingShiftListByUserToday;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryWorkingShiftListByUserToday = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/working-shift/list-by-user-today", params],
    queryFn: () => httpRequestWorkingShiftListByUserToday(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};
