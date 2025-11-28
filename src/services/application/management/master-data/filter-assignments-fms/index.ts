import { supabaseFmsService } from "@/services/supabase";

// Filter Group Filter Assignment
export interface IFilterGroupFilter {
  id: number;
  group_code: string;
  project_code: string;
  filter_definition_id: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Filter User Filter Assignment
export interface IFilterUserFilter {
  id: number;
  username: string;
  project_code: string;
  filter_definition_id: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Get filter definitions assigned to a group
 */
export const httpRequestGetGroupFilters = async (
  groupCode: string,
  projectCode: string,
): Promise<number[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_filter_group_filters")
      .select("filter_definition_id")
      .eq("group_code", groupCode)
      .eq("project_code", projectCode);

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => item.filter_definition_id);
  } catch (error) {
    console.error("Error fetching group filters:", error);
    throw error;
  }
};

/**
 * Assign filter definitions to a group
 */
export const httpRequestAssignGroupFilters = async (
  groupCode: string,
  projectCode: string,
  filterDefinitionIds: number[],
): Promise<void> => {
  try {
    // First, delete all existing assignments
    const { error: deleteError } = await supabaseFmsService.client
      .from("fms_mst_filter_group_filters")
      .delete()
      .eq("group_code", groupCode)
      .eq("project_code", projectCode);

    if (deleteError) {
      throw deleteError;
    }

    // Then, insert new assignments
    if (filterDefinitionIds.length > 0) {
      const assignments = filterDefinitionIds.map((filterDefinitionId) => ({
        group_code: groupCode,
        project_code: projectCode,
        filter_definition_id: filterDefinitionId,
      }));

      const { error: insertError } = await supabaseFmsService.client
        .from("fms_mst_filter_group_filters")
        .insert(assignments);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error assigning group filters:", error);
    throw error;
  }
};

/**
 * Get filter definitions assigned to a user
 */
export const httpRequestGetUserFilters = async (
  username: string,
  projectCode: string,
): Promise<number[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_filter_user_filters")
      .select("filter_definition_id")
      .eq("username", username)
      .eq("project_code", projectCode);

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => item.filter_definition_id);
  } catch (error) {
    console.error("Error fetching user filters:", error);
    throw error;
  }
};

/**
 * Assign filter definitions to a user
 */
export const httpRequestAssignUserFilters = async (
  username: string,
  projectCode: string,
  filterDefinitionIds: number[],
): Promise<void> => {
  try {
    // First, delete all existing assignments
    const { error: deleteError } = await supabaseFmsService.client
      .from("fms_mst_filter_user_filters")
      .delete()
      .eq("username", username)
      .eq("project_code", projectCode);

    if (deleteError) {
      throw deleteError;
    }

    // Then, insert new assignments
    if (filterDefinitionIds.length > 0) {
      const assignments = filterDefinitionIds.map((filterDefinitionId) => ({
        username,
        project_code: projectCode,
        filter_definition_id: filterDefinitionId,
      }));

      const { error: insertError } = await supabaseFmsService.client
        .from("fms_mst_filter_user_filters")
        .insert(assignments);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error assigning user filters:", error);
    throw error;
  }
};

