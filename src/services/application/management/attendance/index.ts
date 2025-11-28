import { supabaseFmsService } from "@/services/supabase";
import type { IAttendance, GetAttendanceParams, AttendanceStatistics } from "./types";

/**
 * Get attendance records with filters
 */
export const httpRequestGetAttendance = async (
  params: GetAttendanceParams,
): Promise<{ data: IAttendance[]; count: number }> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_app_data_attendance")
      .select("*", { count: "exact" })
      .eq("project_code", params.project_code);

    if (params.start_date) {
      query = query.gte("checkin_time", params.start_date);
    }

    if (params.end_date) {
      query = query.lte("checkin_time", params.end_date);
    }

    if (params.username) {
      query = query.eq("username", params.username);
    }

    if (params.location_id) {
      query = query.eq("location_id", params.location_id);
    }

    if (params.workshift_id) {
      query = query.eq("workshift_id", params.workshift_id);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.timing_status) {
      query = query.eq("timing_status", params.timing_status);
    }

    query = query.order("checkin_time", { ascending: false });

    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(
        params.offset,
        params.offset + (params.limit || 10) - 1,
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as IAttendance[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

/**
 * Get attendance statistics
 */
export const httpRequestGetAttendanceStatistics = async (
  params: GetAttendanceParams,
): Promise<AttendanceStatistics> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_app_data_attendance")
      .select("*")
      .eq("project_code", params.project_code);

    if (params.start_date) {
      query = query.gte("checkin_time", params.start_date);
    }

    if (params.end_date) {
      query = query.lte("checkin_time", params.end_date);
    }

    if (params.username) {
      query = query.eq("username", params.username);
    }

    if (params.location_id) {
      query = query.eq("location_id", params.location_id);
    }

    if (params.workshift_id) {
      query = query.eq("workshift_id", params.workshift_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const records = (data || []) as IAttendance[];

    const stats: AttendanceStatistics = {
      total: records.length,
      checked_in: records.filter((r) => r.status === "CHECKED_IN").length,
      checked_out: records.filter((r) => r.status === "CHECKED_OUT").length,
      auto_checked_out: records.filter((r) => r.status === "AUTO_CHECKED_OUT").length,
      on_time: records.filter((r) => r.timing_status === "ON_TIME").length,
      late: records.filter((r) => r.timing_status === "LATE").length,
      early: records.filter((r) => r.timing_status === "EARLY").length,
      absent: records.filter((r) => r.timing_status === "ABSENT").length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);
    throw error;
  }
};


