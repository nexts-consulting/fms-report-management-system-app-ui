import { supabaseFmsService } from "@/services/supabase";

export type FilterLogicOperator =
  | "AND"
  | "OR"
  | "IN"
  | "NOT IN"
  | "LIKE"
  | "NOT LIKE"
  | "IS NULL"
  | "IS NOT NULL"
  | "EXISTS"
  | "NOT EXISTS"
  | "GREATER THAN"
  | "LESS THAN"
  | "GREATER THAN OR EQUAL TO"
  | "LESS THAN OR EQUAL TO";

export interface IFilterDefinition {
  id: number;
  project_code: string;
  table_name: string;
  column_name: string;
  operator: string;
  value: string;
  logic_operator: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateFilterDefinitionInput {
  project_code: string;
  table_name: string;
  column_name: string;
  operator: string;
  value: string;
  logic_operator?: string | null;
  metadata?: Record<string, any>;
}

export interface UpdateFilterDefinitionInput {
  table_name?: string;
  column_name?: string;
  operator?: string;
  value?: string;
  logic_operator?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Get all filter definitions for a project
 */
export const httpRequestGetFilterDefinitions = async (
  projectCode: string,
  tableName?: string,
): Promise<IFilterDefinition[]> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_mst_filter_definitions")
      .select("*")
      .eq("project_code", projectCode);

    if (tableName) {
      query = query.eq("table_name", tableName);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as IFilterDefinition[];
  } catch (error) {
    console.error("Error fetching filter definitions:", error);
    throw error;
  }
};

/**
 * Get filter definition by ID
 */
export const httpRequestGetFilterDefinitionById = async (
  id: number,
): Promise<IFilterDefinition | null> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_filter_definitions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as IFilterDefinition;
  } catch (error) {
    console.error("Error fetching filter definition by ID:", error);
    throw error;
  }
};

/**
 * Create a new filter definition
 */
export const httpRequestCreateFilterDefinition = async (
  input: CreateFilterDefinitionInput,
): Promise<IFilterDefinition> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_filter_definitions")
      .insert({
        ...input,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as IFilterDefinition;
  } catch (error) {
    console.error("Error creating filter definition:", error);
    throw error;
  }
};

/**
 * Update a filter definition
 */
export const httpRequestUpdateFilterDefinition = async (
  id: number,
  input: UpdateFilterDefinitionInput,
): Promise<IFilterDefinition> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_filter_definitions")
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

    return data as IFilterDefinition;
  } catch (error) {
    console.error("Error updating filter definition:", error);
    throw error;
  }
};

/**
 * Delete a filter definition
 */
export const httpRequestDeleteFilterDefinition = async (id: number): Promise<void> => {
  try {
    const { error } = await supabaseFmsService.client
      .from("fms_mst_filter_definitions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting filter definition:", error);
    throw error;
  }
};

