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
 * Create a placeholder location for user workshifts
 * Note: User workshifts don't have location info, so we'll use a placeholder
 */
const createPlaceholderLocation = (): ILocationModel => {
  return {
    id: 0,
    project_code: "",
    code: "",
    name: "Địa điểm chưa xác định",
    address: "",
    latitude: 0,
    longitude: 0,
    checkin_radius_meters: 100,
    created_at: "",
    updated_at: "",
    admin_division_id: null,
    metadata: {},
  };
};

/**
 * Map IUserWorkshift to IWorkingShift
 */
const mapUserWorkshiftToWorkingShift = (
  userWorkshift: IUserWorkshift,
): IWorkingShiftLocation => {
  return {
    id: userWorkshift.workshift_id,
    name: userWorkshift.workshift_name || "Ca làm việc",
    start_time: userWorkshift.workshift_start_time || "",
    end_time: userWorkshift.workshift_end_time || "",
    location: createPlaceholderLocation(),
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
    );

    // Filter by username
    const filtered = userWorkshifts.filter(
      (uw) => uw.username === params.username,
    );

    // Map to IWorkingShift format
    const data = filtered.map((uw) => mapUserWorkshiftToWorkingShift(uw));

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
