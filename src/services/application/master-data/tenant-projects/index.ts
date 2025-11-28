import { supabaseMasterService } from "@/services/supabase";

export interface ITenantProject {
  id: string;
  tenant_id: string;
  client_code: string | null;
  client_name: string | null;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "ENDED";
  start_date: string | null;
  end_date: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

/**
 * Get all projects for a tenant
 * @param tenantId - Tenant ID
 * @param status - Optional status filter
 * @returns Array of tenant projects
 */
export const httpRequestGetTenantProjects = async (
  tenantId: string,
  status?: "ACTIVE" | "INACTIVE" | "ENDED",
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

export interface CreateTenantProjectInput {
  tenant_id: string;
  code: string;
  name: string;
  client_code?: string | null;
  client_name?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "ENDED";
  start_date?: string | null;
  end_date?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
}

export interface UpdateTenantProjectInput {
  name?: string;
  client_code?: string | null;
  client_name?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "ENDED";
  start_date?: string | null;
  end_date?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
}

/**
 * Create a new tenant project
 */
export const httpRequestCreateTenantProject = async (
  input: CreateTenantProjectInput,
): Promise<ITenantProject> => {
  try {
    // Supabase will auto-generate UUID if id is not provided
    // But we need to provide it explicitly for consistency
    const projectId = crypto.randomUUID();

    const { data, error } = await supabaseMasterService.client
      .from("tenant_projects")
      .insert({
        id: projectId,
        ...input,
        status: input.status || "ACTIVE",
        version: 1,
      })
      .select()
      .single();

    if (error) throw error;

    return data as ITenantProject;
  } catch (error) {
    console.error("Error creating tenant project:", error);
    throw error;
  }
};

/**
 * Update a tenant project
 */
export const httpRequestUpdateTenantProject = async (
  id: string,
  input: UpdateTenantProjectInput,
): Promise<ITenantProject> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("tenant_projects")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as ITenantProject;
  } catch (error) {
    console.error("Error updating tenant project:", error);
    throw error;
  }
};

/**
 * Delete a tenant project (soft delete by setting status to ENDED)
 */
export const httpRequestDeleteTenantProject = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseMasterService.client
      .from("tenant_projects")
      .update({
        status: "ENDED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting tenant project:", error);
    throw error;
  }
};

