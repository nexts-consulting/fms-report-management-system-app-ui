import { supabaseMasterService } from "@/services/supabase";
import type {
  ITenantProject,
  TenantProjectStatus,
} from "@/types/model";

/**
 * Get all projects for a tenant
 * @param tenantId - Tenant ID
 * @param status - Optional status filter
 * @returns Array of tenant projects
 */
export const httpRequestGetTenantProjects = async (
  tenantId: string,
  status?: TenantProjectStatus,
): Promise<ITenantProject[]> => {
  try {
    let query = supabaseMasterService.client
      .from("tenant_projects")
      .select("*")
      .eq("tenant_id", tenantId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ITenantProject[];
  } catch (error) {
    console.error("Error fetching tenant projects:", error);
    throw error;
  }
};

/**
 * Get project by code
 * @param projectCode - Project code
 * @returns Project object or null if not found
 */
export const httpRequestGetProjectByCode = async (
  projectCode: string,
): Promise<ITenantProject | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("tenant_projects")
      .select("*")
      .eq("code", projectCode)
      .eq("status", "ACTIVE")
      .single();

    if (error) {
      // If no record is found, return null
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as ITenantProject;
  } catch (error) {
    console.error("Error fetching project by code:", error);
    throw error;
  }
};
