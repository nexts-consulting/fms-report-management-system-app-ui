import { supabaseFmsService } from "@/services/supabase";

export interface ILocation {
  id: number;
  project_code: string;
  code: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  checkin_radius_meters: number;
  admin_division_id: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationInput {
  project_code: string;
  code: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  checkin_radius_meters?: number;
  admin_division_id?: number | null;
  metadata?: Record<string, any>;
}

export interface UpdateLocationInput {
  name?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  checkin_radius_meters?: number;
  admin_division_id?: number | null;
  metadata?: Record<string, any>;
}

export interface GetLocationsParams {
  project_code: string;
  search?: string;
  admin_division_id?: number | null;
  admin_division_ids?: number[];
  location_ids?: number[];
  limit?: number;
  offset?: number;
}

/**
 * Get all locations for a project
 */
export const httpRequestGetLocations = async (
  params: GetLocationsParams,
): Promise<{ data: ILocation[]; count: number }> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_mst_locations")
      .select("*", { count: "exact" })
      .eq("project_code", params.project_code);

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
    }

    // Filter by single division ID (for backward compatibility)
    if (params.admin_division_id) {
      query = query.eq("admin_division_id", params.admin_division_id);
    }

    // Filter by multiple division IDs (includes parent and all children)
    if (params.admin_division_ids && params.admin_division_ids.length > 0) {
      query = query.in("admin_division_id", params.admin_division_ids);
    }

    // Filter by location IDs (for category filtering)
    if (params.location_ids && params.location_ids.length > 0) {
      query = query.in("id", params.location_ids);
    }

    query = query.order("created_at", { ascending: false });

    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: (data || []) as ILocation[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

/**
 * Get location by ID
 */
export const httpRequestGetLocationById = async (
  id: number,
): Promise<ILocation | null> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as ILocation;
  } catch (error) {
    console.error("Error fetching location by ID:", error);
    throw error;
  }
};

/**
 * Create a new location
 */
export const httpRequestCreateLocation = async (
  input: CreateLocationInput,
): Promise<ILocation> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_locations")
      .insert({
        ...input,
        checkin_radius_meters: input.checkin_radius_meters || 100,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ILocation;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};

/**
 * Update a location
 */
export const httpRequestUpdateLocation = async (
  id: number,
  input: UpdateLocationInput,
): Promise<ILocation> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_locations")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ILocation;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

/**
 * Delete a location
 */
export const httpRequestDeleteLocation = async (id: number): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_mst_locations")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
};

