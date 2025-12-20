import { supabaseFmsService } from "@/services/supabase";
import dayjs from "dayjs";
import type {
  IWorkshift,
  ILocationWorkshift,
  IUserWorkshift,
  GetWorkshiftsParams,
  GetLocationWorkshiftsParams,
  GetUserWorkshiftsParams,
} from "@/types/model";

// ==================== Workshifts ====================
export const httpRequestGetWorkshifts = async (
  params: GetWorkshiftsParams,
): Promise<{ data: IWorkshift[]; count: number }> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_app_data_workshifts")
      .select("*", { count: "exact" })
      .eq("project_code", params.project_code);

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%`);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.is_active !== undefined) {
      query = query.eq("is_active", params.is_active);
    }

    query = query.order("created_at", { ascending: false });

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
      data: (data || []) as IWorkshift[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching workshifts:", error);
    throw error;
  }
};

/**
 * Get workshifts by date range for calendar view
 * Note: start_time and end_time are timestamps, so we need to check if they fall within the date range
 */
export const httpRequestGetWorkshiftsByDateRange = async (
  projectCode: string,
  startDate: string,
  endDate: string,
): Promise<IWorkshift[]> => {
  try {
    // Get all active workshifts for the project
    // We'll filter by date range in the application layer since
    // workshifts can span multiple days
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_workshifts")
      .select("*")
      .eq("project_code", projectCode)
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) throw error;

    // Filter workshifts that overlap with the date range
    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    const filtered = (data || []).filter((ws: IWorkshift) => {
      const wsStart = dayjs(ws.start_time);
      const wsEnd = dayjs(ws.end_time);
      
      // Check if workshift overlaps with date range
      // Workshift overlaps if: wsStart <= end AND wsEnd >= start
      return (
        (wsStart.isBefore(end) || wsStart.isSame(end, "day")) &&
        (wsEnd.isAfter(start) || wsEnd.isSame(start, "day"))
      );
    });

    return filtered as IWorkshift[];
  } catch (error) {
    console.error("Error fetching workshifts by date range:", error);
    throw error;
  }
};

export const httpRequestGetWorkshiftById = async (
  id: number,
): Promise<IWorkshift | null> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_workshifts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as IWorkshift;
  } catch (error) {
    console.error("Error fetching workshift by ID:", error);
    throw error;
  }
};
export const httpRequestDeleteWorkshift = async (id: number): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_app_data_workshifts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting workshift:", error);
    throw error;
  }
};

// ==================== Location Workshifts ====================
export const httpRequestGetLocationWorkshifts = async (
  params: GetLocationWorkshiftsParams,
): Promise<{ data: ILocationWorkshift[]; count: number }> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_app_data_location_workshifts")
      .select(
        `
        *,
        fms_mst_locations!inner(name, code),
        fms_app_data_workshifts!inner(name, start_time, end_time)
      `,
        { count: "exact" },
      )
      .eq("project_code", params.project_code);

    if (params.location_id) {
      query = query.eq("location_id", params.location_id);
    }

    if (params.workshift_id) {
      query = query.eq("workshift_id", params.workshift_id);
    }

    query = query.order("created_at", { ascending: false });

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

    // Transform joined data
    const transformedData = (data || []).map((item: any) => ({
      ...item,
      location_name: item.fms_mst_locations?.name,
      location_code: item.fms_mst_locations?.code,
      workshift_name: item.fms_app_data_workshifts?.name,
      workshift_start_time: item.fms_app_data_workshifts?.start_time,
      workshift_end_time: item.fms_app_data_workshifts?.end_time,
    }));

    return {
      data: transformedData as ILocationWorkshift[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching location workshifts:", error);
    throw error;
  }
};

export const httpRequestDeleteLocationWorkshift = async (
  id: number,
): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_app_data_location_workshifts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting location workshift:", error);
    throw error;
  }
};

/**
 * Get location workshifts by date range for calendar view
 */
export const httpRequestGetLocationWorkshiftsByDateRange = async (
  projectCode: string,
  startDate: string,
  endDate: string,
): Promise<ILocationWorkshift[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_location_workshifts")
      .select(
        `
        *,
        fms_mst_locations!inner(id, name, code, address, latitude, longitude, checkin_radius_meters, admin_division_id, metadata, created_at, updated_at),
        fms_app_data_workshifts!inner(id, name, start_time, end_time, status)
      `,
      )
      .eq("project_code", projectCode)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform joined data
    const transformedData = (data || []).map((item: any) => ({
      ...item,
      location_name: item.fms_mst_locations?.name,
      location_code: item.fms_mst_locations?.code,
      location_id: item.fms_mst_locations?.id,
      location_address: item.fms_mst_locations?.address,
      location_latitude: item.fms_mst_locations?.latitude,
      location_longitude: item.fms_mst_locations?.longitude,
      location_checkin_radius_meters: item.fms_mst_locations?.checkin_radius_meters,
      location_admin_division_id: item.fms_mst_locations?.admin_division_id,
      location_metadata: item.fms_mst_locations?.metadata,
      location_created_at: item.fms_mst_locations?.created_at,
      location_updated_at: item.fms_mst_locations?.updated_at,
      workshift_name: item.fms_app_data_workshifts?.name,
      workshift_id: item.fms_app_data_workshifts?.id,
      workshift_start_time: item.fms_app_data_workshifts?.start_time,
      workshift_end_time: item.fms_app_data_workshifts?.end_time,
      workshift_status: item.fms_app_data_workshifts?.status,
    }));

    // Filter workshifts that overlap with the date range
    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    const filtered = transformedData.filter((item: any) => {
      if (!item.workshift_start_time) return false;
      const wsStart = dayjs(item.workshift_start_time);
      const wsEnd = dayjs(item.workshift_end_time);
      
      return (
        (wsStart.isBefore(end) || wsStart.isSame(end, "day")) &&
        (wsEnd.isAfter(start) || wsEnd.isSame(start, "day"))
      );
    });

    return filtered as ILocationWorkshift[];
  } catch (error) {
    console.error("Error fetching location workshifts by date range:", error);
    throw error;
  }
};

// ==================== User Workshifts ====================
export const httpRequestGetUserWorkshifts = async (
  params: GetUserWorkshiftsParams,
): Promise<{ data: IUserWorkshift[]; count: number }> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_app_data_user_workshifts")
      .select(
        `
        *,
        fms_app_data_workshifts!inner(name, start_time, end_time, status)
      `,
        { count: "exact" },
      )
      .eq("project_code", params.project_code);

    if (params.username) {
      query = query.eq("username", params.username);
    }

    if (params.workshift_id) {
      query = query.eq("workshift_id", params.workshift_id);
    }

    query = query.order("created_at", { ascending: false });

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

    // Transform joined data
    const transformedData = (data || []).map((item: any) => ({
      ...item,
      workshift_name: item.fms_app_data_workshifts?.name,
      workshift_start_time: item.fms_app_data_workshifts?.start_time,
      workshift_end_time: item.fms_app_data_workshifts?.end_time,
      workshift_status: item.fms_app_data_workshifts?.status,
    }));

    return {
      data: transformedData as IUserWorkshift[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching user workshifts:", error);
    throw error;
  }
};

export const httpRequestDeleteUserWorkshift = async (
  id: number,
): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_app_data_user_workshifts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting user workshift:", error);
    throw error;
  }
};

/**
 * Get user workshifts by date range for calendar view
 */
export const httpRequestGetUserWorkshiftsByDateRange = async (
  projectCode: string,
  startDate: string,
  endDate: string,
): Promise<IUserWorkshift[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_app_data_user_workshifts")
      .select(
        `
        *,
        fms_app_data_workshifts!inner(id, name, start_time, end_time, status)
      `,
      )
      .eq("project_code", projectCode)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform joined data
    const transformedData = (data || []).map((item: any) => ({
      ...item,
      workshift_id: item.fms_app_data_workshifts?.id,
      workshift_name: item.fms_app_data_workshifts?.name,
      workshift_start_time: item.fms_app_data_workshifts?.start_time,
      workshift_end_time: item.fms_app_data_workshifts?.end_time,
      workshift_status: item.fms_app_data_workshifts?.status,
    }));

    // Filter workshifts that overlap with the date range
    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    const filtered = transformedData.filter((item: any) => {
      if (!item.workshift_start_time) return false;
      const wsStart = dayjs(item.workshift_start_time);
      const wsEnd = dayjs(item.workshift_end_time);
      
      return (
        (wsStart.isBefore(end) || wsStart.isSame(end, "day")) &&
        (wsEnd.isAfter(start) || wsEnd.isSame(start, "day"))
      );
    });

    return filtered as IUserWorkshift[];
  } catch (error) {
    console.error("Error fetching user workshifts by date range:", error);
    throw error;
  }
};
