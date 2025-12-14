import { ExtractFnReturnType } from "@/libs/react-query";
import { QueryConfig } from "@/libs/react-query";
import { IWorkingShift, ILocation as ILocationModel, ILocation } from "@/types/model";
import { useQuery } from "react-query";
import {
  httpRequestGetUserWorkshiftsByDateRange,
} from "@/services/application/management/work-shifts";
import dayjs from "dayjs";
import { IUserWorkshift } from "@/services/application/management/work-shifts/types";

type HttpRequestWorkingShiftListByUserToday = {
  projectCode: string;
  username: string;
};

type WorkingShiftListByUserTodayResponseData = {
  data: IWorkingShift[];
};

/**
 * Create a placeholder location for user workshifts
 * Note: User workshifts don't have location info, so we'll use a placeholder
 */
const createPlaceholderLocation = (): ILocation => {
  return {
    id: 0,
    code: "",
    name: "Địa điểm chưa xác định",
    address: "",
    latitude: 0,
    longitude: 0,
    checkinRadiusMeters: 100,
    createdAt: "",
    updatedAt: "",
    province: {
      id: 0,
      name: "",
    },
  };
};

/**
 * Map IUserWorkshift to IWorkingShift
 */
const mapUserWorkshiftToWorkingShift = (
  userWorkshift: IUserWorkshift,
): IWorkingShift => {
  return {
    id: userWorkshift.workshift_id,
    name: userWorkshift.workshift_name || "Ca làm việc",
    startTime: userWorkshift.workshift_start_time || "",
    endTime: userWorkshift.workshift_end_time || "",
    location: createPlaceholderLocation(),
  };
};

const httpRequestWorkingShiftListByUserToday = async (
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

const useQueryWorkingShiftListByUserToday = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/working-shift/list-by-user-today", params],
    queryFn: () => httpRequestWorkingShiftListByUserToday(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export {
  httpRequestWorkingShiftListByUserToday,
  useQueryWorkingShiftListByUserToday,
};
export type { WorkingShiftListByUserTodayResponseData };

