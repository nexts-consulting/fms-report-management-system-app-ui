import { supabaseFmsService } from "@/services/supabase";

export type AdminDivisionType = "ADMIN" | "ZONE" | "REGION" | "AREA";

export interface IAdminDivision {
  id: number;
  project_code: string;
  code: string | null;
  name: string;
  level: number;
  type: AdminDivisionType;
  parent_id: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IAdminDivisionWithChildren extends IAdminDivision {
  children?: IAdminDivisionWithChildren[];
}

export interface CreateAdminDivisionInput {
  project_code: string;
  code?: string | null;
  name: string;
  level: number;
  type?: AdminDivisionType;
  parent_id?: number | null;
  metadata?: Record<string, any>;
}

export interface UpdateAdminDivisionInput {
  name?: string;
  level?: number;
  type?: AdminDivisionType;
  parent_id?: number | null;
  metadata?: Record<string, any>;
}

/**
 * Get all admin divisions for a project
 * @param projectCode - Project code
 * @returns Array of admin divisions
 */
export const httpRequestGetAdminDivisions = async (
  projectCode: string,
): Promise<IAdminDivision[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_admin_divisions")
      .select("*")
      .eq("project_code", projectCode)
      .order("level", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as IAdminDivision[];
  } catch (error) {
    console.error("Error fetching admin divisions:", error);
    throw error;
  }
};

/**
 * Get admin division by ID
 * @param id - Admin division ID
 * @returns Admin division or null if not found
 */
export const httpRequestGetAdminDivisionById = async (
  id: number,
): Promise<IAdminDivision | null> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_admin_divisions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as IAdminDivision;
  } catch (error) {
    console.error("Error fetching admin division by ID:", error);
    throw error;
  }
};

/**
 * Create a new admin division
 * @param input - Admin division data
 * @returns Created admin division
 */
export const httpRequestCreateAdminDivision = async (
  input: CreateAdminDivisionInput,
): Promise<IAdminDivision> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_admin_divisions")
      .insert({
        ...input,
        type: input.type || "ADMIN",
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as IAdminDivision;
  } catch (error) {
    console.error("Error creating admin division:", error);
    throw error;
  }
};

/**
 * Update an admin division
 * @param id - Admin division ID
 * @param input - Update data
 * @returns Updated admin division
 */
export const httpRequestUpdateAdminDivision = async (
  id: number,
  input: UpdateAdminDivisionInput,
): Promise<IAdminDivision> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_admin_divisions")
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

    return data as IAdminDivision;
  } catch (error) {
    console.error("Error updating admin division:", error);
    throw error;
  }
};

/**
 * Delete an admin division
 * @param id - Admin division ID
 */
export const httpRequestDeleteAdminDivision = async (id: number): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_mst_admin_divisions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting admin division:", error);
    throw error;
  }
};

/**
 * Build tree structure from flat list of admin divisions
 * @param divisions - Flat list of admin divisions
 * @returns Tree structure with children
 */
export const buildAdminDivisionTree = (
  divisions: IAdminDivision[],
): IAdminDivisionWithChildren[] => {
  const divisionMap = new Map<number, IAdminDivisionWithChildren>();
  const rootDivisions: IAdminDivisionWithChildren[] = [];

  // First pass: create map of all divisions
  divisions.forEach((div) => {
    divisionMap.set(div.id, { ...div, children: [] });
  });

  // Second pass: build tree structure
  divisions.forEach((div) => {
    const divisionWithChildren = divisionMap.get(div.id)!;
    if (div.parent_id && divisionMap.has(div.parent_id)) {
      const parent = divisionMap.get(div.parent_id)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(divisionWithChildren);
    } else {
      rootDivisions.push(divisionWithChildren);
    }
  });

  return rootDivisions;
};

/**
 * Get all child division IDs recursively from a parent division
 * @param divisions - Flat list of all admin divisions
 * @param parentId - Parent division ID
 * @returns Array of all child division IDs (including the parent itself)
 */
export const getAllChildDivisionIds = (
  divisions: IAdminDivision[],
  parentId: number,
): number[] => {
  const result: number[] = [parentId];
  
  const findChildren = (parentId: number) => {
    const children = divisions.filter((div) => div.parent_id === parentId);
    for (const child of children) {
      result.push(child.id);
      findChildren(child.id); // Recursively find grandchildren
    }
  };
  
  findChildren(parentId);
  return result;
};

