import { supabaseFmsService } from "@/services/supabase";

export type LocationCategoryType = "GROUP" | "CATEGORY" | "TYPE";

export interface ILocationCategory {
  id: number;
  project_code: string;
  code: string;
  name: string;
  description: string | null;
  parent_id: number | null;
  category_type: LocationCategoryType;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ILocationCategoryWithChildren extends ILocationCategory {
  children?: ILocationCategoryWithChildren[];
}

export interface CreateLocationCategoryInput {
  project_code: string;
  code: string;
  name: string;
  description?: string | null;
  parent_id?: number | null;
  category_type?: LocationCategoryType;
  metadata?: Record<string, any>;
}

export interface UpdateLocationCategoryInput {
  name?: string;
  description?: string | null;
  parent_id?: number | null;
  category_type?: LocationCategoryType;
  metadata?: Record<string, any>;
}

/**
 * Get all location categories for a project
 */
export const httpRequestGetLocationCategories = async (
  projectCode: string,
): Promise<ILocationCategory[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_categories")
      .select("*")
      .eq("project_code", projectCode)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as ILocationCategory[];
  } catch (error) {
    console.error("Error fetching location categories:", error);
    throw error;
  }
};

/**
 * Get location category by ID
 */
export const httpRequestGetLocationCategoryById = async (
  id: number,
): Promise<ILocationCategory | null> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as ILocationCategory;
  } catch (error) {
    console.error("Error fetching location category by ID:", error);
    throw error;
  }
};

/**
 * Create a new location category
 */
export const httpRequestCreateLocationCategory = async (
  input: CreateLocationCategoryInput,
): Promise<ILocationCategory> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_categories")
      .insert({
        ...input,
        category_type: input.category_type || "GROUP",
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ILocationCategory;
  } catch (error) {
    console.error("Error creating location category:", error);
    throw error;
  }
};

/**
 * Update a location category
 */
export const httpRequestUpdateLocationCategory = async (
  id: number,
  input: UpdateLocationCategoryInput,
): Promise<ILocationCategory> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_location_categories")
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

    return data as ILocationCategory;
  } catch (error) {
    console.error("Error updating location category:", error);
    throw error;
  }
};

/**
 * Delete a location category
 */
export const httpRequestDeleteLocationCategory = async (id: number): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_mst_location_categories")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting location category:", error);
    throw error;
  }
};

/**
 * Build tree structure from flat list of location categories
 */
export const buildLocationCategoryTree = (
  categories: ILocationCategory[],
): ILocationCategoryWithChildren[] => {
  const categoryMap = new Map<number, ILocationCategoryWithChildren>();
  const rootCategories: ILocationCategoryWithChildren[] = [];

  // First pass: create map of all categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build tree structure
  categories.forEach((cat) => {
    const categoryWithChildren = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      const parent = categoryMap.get(cat.parent_id)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(categoryWithChildren);
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  return rootCategories;
};

/**
 * Get all child category IDs recursively from a parent category
 * @param categories - Flat list of all location categories
 * @param parentId - Parent category ID
 * @returns Array of all child category IDs (including the parent itself)
 */
export const getAllChildCategoryIds = (
  categories: ILocationCategory[],
  parentId: number,
): number[] => {
  const result: number[] = [parentId];
  
  const findChildren = (parentId: number) => {
    const children = categories.filter((cat) => cat.parent_id === parentId);
    for (const child of children) {
      result.push(child.id);
      findChildren(child.id); // Recursively find grandchildren
    }
  };
  
  findChildren(parentId);
  return result;
};

