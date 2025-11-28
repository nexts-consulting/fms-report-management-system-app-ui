import { supabaseFmsService } from "@/services/supabase";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { IStaffAttendance } from "@/types/model";
import { useQuery } from "react-query";
import type { IAttendance } from "@/services/application/management/attendance/types";

type HttpRequestCurrentShiftParams = {
  username: string;
  project_code: string;
};

type CurrentShiftResponseData = {
  data: IStaffAttendance | null;
};

const httpRequestCurrentShift = async (
  params: HttpRequestCurrentShiftParams,
): Promise<CurrentShiftResponseData> => {
  try {
    // Query current attendance record (status = CHECKED_IN, not yet checked out)
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_attendance")
      .select("*")
      .eq("username", params.username)
      .eq("project_code", params.project_code)
      .eq("status", "CHECKED_IN")
      .order("checkin_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // If no record found (PGRST116), return null
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    // If no data found, return null
    if (!data) {
      return { data: null };
    }

    const attendance = data as IAttendance;

    // Map IAttendance to IStaffAttendance format
    // Note: This is a basic mapping. Full IStaffAttendance requires additional data
    // from related tables (staff, shift, reports, etc.) which may need additional queries
    const staffAttendance: IStaffAttendance = {
      id: attendance.id,
      staff: {
        // Basic staff info - may need to query from staff table
        id: 0, // TODO: Query from staff table using username
        staffCode: attendance.username,
        fullName: attendance.username, // TODO: Get from staff table
        profileImage: "",
        trainingDate: "",
        startDate: "",
        passProbationDate: "",
        updatedAt: attendance.updated_at,
        account: {
          id: 0, // TODO: Query from account table
          username: attendance.username,
          role: "STAFF" as any, // TODO: Get from account table
          createdAt: attendance.created_at,
        },
      },
      shift: {
        // Basic shift info - may need to query from workshift table
        id: attendance.workshift_id || 0,
        name: attendance.workshift_name,
        outlet: {
          // Basic outlet info - may need to query from location table
          id: attendance.location_id || 0,
          code: attendance.location_code,
          name: attendance.location_name,
          province: null as any, // TODO: Query from location table
        },
      } as any,
      checkinTime: attendance.checkin_time || "",
      checkoutTime: attendance.checkout_time,
      checkinImage: attendance.checkin_photo_url || "",
      checkoutImage: attendance.checkout_photo_url,
      checkinLocation: {
        lat: attendance.checkin_lat || 0,
        lng: attendance.checkin_lng || 0,
        acc: 0, // TODO: Get from metadata if available
      },
      checkoutLocation: attendance.checkout_lat && attendance.checkout_lng
        ? {
            lat: attendance.checkout_lat,
            lng: attendance.checkout_lng,
            acc: 0, // TODO: Get from metadata if available
          }
        : null,
      saleReport: null, // TODO: Query from reports table if needed
      oosReport: null, // TODO: Query from reports table if needed
      stockInReport: null, // TODO: Query from reports table if needed
      stockOutReport: null, // TODO: Query from reports table if needed
      samplingReport: null, // TODO: Query from reports table if needed
      activityReport: null, // TODO: Query from reports table if needed
      staffLeaves: [], // TODO: Query from staff_leaves table if needed
    };

    return { data: staffAttendance };
  } catch (error) {
    console.error("Error fetching current shift attendance:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestCurrentShift;

type QueryOptions = {
  params: HttpRequestCurrentShiftParams;
  config?: QueryConfig<QueryFnType>;
};

const useQueryCurrentShift = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/attendance/current-shift", params],
    queryFn: () => httpRequestCurrentShift(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestCurrentShift, useQueryCurrentShift };
export type { CurrentShiftResponseData };
