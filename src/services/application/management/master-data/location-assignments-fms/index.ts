import { supabaseFmsService } from "@/services/supabase";

// Location Category Assignment
export interface ILocationCategoryAssignment {
  location_id: number;
  category_id: number;
}

// Location Admin Division Assignment
export interface ILocationAdminDivision {
  location_id: number;
  admin_division_id: number;
}

/**
 * Get location categories assigned to a location
 */
export const httpRequestGetLocationCategories = async (
  locationId: number,
): Promise<number[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_category_assignments")
      .select("category_id")
      .eq("location_id", locationId);

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => item.category_id);
  } catch (error) {
    console.error("Error fetching location categories:", error);
    throw error;
  }
};

/**
 * Assign categories to a location
 */
export const httpRequestAssignLocationCategories = async (
  locationId: number,
  categoryIds: number[],
): Promise<void> => {
  try {
    // First, delete all existing assignments
    const { error: deleteError } = await supabaseFmsService.client
      .from("fms_mst_location_category_assignments")
      .delete()
      .eq("location_id", locationId);

    if (deleteError) {
      throw deleteError;
    }

    // Then, insert new assignments
    if (categoryIds.length > 0) {
      const assignments = categoryIds.map((categoryId) => ({
        location_id: locationId,
        category_id: categoryId,
      }));

      const { error: insertError } = await supabaseFmsService.client
        .from("fms_mst_location_category_assignments")
        .insert(assignments);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error assigning location categories:", error);
    throw error;
  }
};

/**
 * Get location IDs by category IDs
 * @param categoryIds - Array of category IDs
 * @returns Array of location IDs that have at least one of the specified categories
 */
export const httpRequestGetLocationIdsByCategoryIds = async (
  categoryIds: number[],
): Promise<number[]> => {
  try {
    if (categoryIds.length === 0) {
      return [];
    }

    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_category_assignments")
      .select("location_id")
      .in("category_id", categoryIds);

    if (error) {
      throw error;
    }

    // Get unique location IDs
    const uniqueLocationIds = Array.from(
      new Set((data || []).map((item: any) => item.location_id)),
    ) as number[];

    return uniqueLocationIds;
  } catch (error) {
    console.error("Error fetching location IDs by category IDs:", error);
    throw error;
  }
};

/**
 * Get admin divisions assigned to a location
 */
export const httpRequestGetLocationAdminDivisions = async (
  locationId: number,
): Promise<number[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_admin_divisions")
      .select("admin_division_id")
      .eq("location_id", locationId);

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => item.admin_division_id);
  } catch (error) {
    console.error("Error fetching location admin divisions:", error);
    throw error;
  }
};

/**
 * Assign admin divisions to a location
 */
export const httpRequestAssignLocationAdminDivisions = async (
  locationId: number,
  adminDivisionIds: number[],
): Promise<void> => {
  try {
    // First, delete all existing assignments
    const { error: deleteError } = await supabaseFmsService.client
      .from("fms_mst_location_admin_divisions")
      .delete()
      .eq("location_id", locationId);

    if (deleteError) {
      throw deleteError;
    }

    // Then, insert new assignments
    if (adminDivisionIds.length > 0) {
      const assignments = adminDivisionIds.map((adminDivisionId) => ({
        location_id: locationId,
        admin_division_id: adminDivisionId,
      }));

      const { error: insertError } = await supabaseFmsService.client
        .from("fms_mst_location_admin_divisions")
        .insert(assignments);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error assigning location admin divisions:", error);
    throw error;
  }
};

