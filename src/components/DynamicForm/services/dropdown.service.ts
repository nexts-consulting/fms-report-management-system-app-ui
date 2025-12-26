/**
 * Dynamic Dropdown Hook
 * 
 * Hook để fetch dropdown options từ Supabase
 */

import React from "react";
import { DropdownItem, FetchDropdownParams, DynamicDropdownConfig } from "../types/dropdown.types";
import { supabaseFmsService } from "@/services/supabase"; // Use FMS route

/**
 * Get current tenant ID and project code from URL params
 */
export function getCurrentTenantAndProject(): { projectCode: string } {
  if (typeof window !== "undefined") {
    const pathParts = window.location.pathname.split("/");
    const projectCode = pathParts[2] || "";
    return {
      projectCode: projectCode,
    };
  }
  return {
    projectCode: "",
  };
}

/**
 * Get location code from localStorage (for condition_1)
 */
export function getLocationCode(): string | null {
  if (typeof window !== "undefined") {
    const location = localStorage.getItem("selected_location");
    if (location) {
      try {
        const parsed = JSON.parse(location);
        return parsed.code || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Fetch dropdown items from Supabase
 */
export async function fetchDropdownItems(
  params: FetchDropdownParams
): Promise<{ data: DropdownItem[] | null; error: string | null }> {
  try {
    let query = supabaseFmsService.client
      .from("fms_mst_report_dropdown")
      .select("*")
      .eq("project_code", params.projectCode)
      .eq("group_code", params.groupCode);

    // Filter by is_active (default true)
    if (params.isActive !== false) {
      query = query.eq("is_active", true);
    }

    // Filter by parent_id
    if (params.parent !== undefined) {
      if (params.parent === null) {
        query = query.is("parent", null);
      } else {
        query = query.eq("parent", params.parent);
      }
    }

    // Filter by condition_1
    if (params.condition1 !== undefined) {
      if (params.condition1 === null) {
        query = query.is("condition_1", null);
      } else {
        query = query.eq("condition_1", params.condition1);
      }
    }

    // Filter by condition_2
    if (params.condition2 !== undefined) {
      if (params.condition2 === null) {
        query = query.is("condition_2", null);
      } else {
        query = query.eq("condition_2", params.condition2);
      }
    }

    // Sort by sort_order
    query = query.order("sort_order", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return { data: null, error: error.message };
    }

    return { data: data as DropdownItem[], error: null };
  } catch (error) {
    console.error("Failed to fetch dropdown items:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convert DropdownItem to SelectOption
 */
export function dropdownItemToSelectOption(item: DropdownItem): {
  label: string;
  value: string;
  disabled?: boolean;
} {
  return {
    label: item.item_label,
    value: item.item_code,
    disabled: !item.is_active,
  };
}

/**
 * Hook to fetch dropdown options
 */
export function useDynamicDropdown(
  config: DynamicDropdownConfig,
  parentValue?: string | null,
  formData?: Record<string, any>
) {
  const [options, setOptions] = React.useState<Array<{ label: string; value: string; disabled?: boolean }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get tenant and project from URL (stable, không thay đổi)
  const { projectCode } = React.useMemo(() => getCurrentTenantAndProject(), []);

  // Get location code if needed (stable until localStorage thay đổi)
  const locationCode = React.useMemo(() => {
    return config.useCondition1 ? getLocationCode() : null;
  }, [config.useCondition1]);

  // Only re-fetch when relevant dependencies change
  React.useEffect(() => {
    const loadOptions = async () => {
      if (!projectCode || !config.groupCode) {
        setOptions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params: FetchDropdownParams = {
          projectCode,
          groupCode: config.groupCode,
          isActive: true,
        };

        // Add parent filter if configured
        if (config.parentField && parentValue !== undefined) {
          params.parent = parentValue || null;
        }

        // Add condition_1 filter if configured
        if (config.useCondition1) {
          params.condition1 = locationCode;
        }

        // Add condition_2 filter if configured
        if (config.useCondition2 && formData) {
          // TODO: Implement condition_2 logic when needed
          params.condition2 = null;
        }

        const { data, error: fetchError } = await fetchDropdownItems(params);

        if (fetchError || !data) {
          setError(fetchError || "Failed to load options");
          setOptions([]);
          return;
        }

        // Apply custom filter if provided
        let filteredData = data;
        if (config.filterItems) {
          filteredData = config.filterItems(data);
        }

        // Transform to select options
        const transformFn = config.transformItem || dropdownItemToSelectOption;
        const selectOptions = filteredData.map(transformFn);

        setOptions(selectOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [
    // Only watch these specific dependencies
    projectCode,
    config.groupCode,
    config.useCondition1,
    parentValue, // Only changes when parent field changes
    locationCode, // Only changes when localStorage changes
    // Removed: formData, config.useCondition2 (not needed unless actually used)
  ]);

  return { options, loading, error };
}


