/**
 * Dynamic Dropdown Hook
 * 
 * Hook để fetch dropdown options từ Supabase với cache mechanism
 */

import React from "react";
import { DropdownItem, FetchDropdownParams, DynamicDropdownConfig } from "../types/dropdown.types";
import { supabaseFmsService } from "@/services/supabase"; // Use FMS route

/**
 * Cache entry interface
 */
interface CacheEntry {
  data: DropdownItem[];
  timestamp: number;
  expiresAt: number;
}

/**
 * Dropdown cache service
 * Sử dụng in-memory cache để giảm thiểu API calls
 */
class DropdownCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultCacheDuration = 300; // 5 minutes in seconds

  /**
   * Generate cache key từ params
   */
  private generateCacheKey(params: FetchDropdownParams): string {
    const parts = [
      params.projectCode,
      params.groupCode,
      params.parent !== undefined ? `parent:${params.parent ?? "null"}` : "",
      params.condition1 !== undefined ? `cond1:${params.condition1 ?? "null"}` : "",
      params.condition2 !== undefined ? `cond2:${params.condition2 ?? "null"}` : "",
      params.isActive !== false ? "active:true" : "active:false",
    ];
    return parts.filter(Boolean).join("|");
  }

  /**
   * Get cached data if exists and not expired
   */
  get(params: FetchDropdownParams, cacheDuration?: number): DropdownItem[] | null {
    const key = this.generateCacheKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      // Cache expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(params: FetchDropdownParams, data: DropdownItem[], cacheDuration?: number): void {
    const key = this.generateCacheKey(params);
    const duration = (cacheDuration ?? this.defaultCacheDuration) * 1000; // Convert to milliseconds
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  /**
   * Clear cache by pattern (e.g., clear all for a groupCode)
   */
  clear(pattern?: {
    projectCode?: string;
    groupCode?: string;
    parent?: string | null;
  }): void {
    if (!pattern) {
      // Clear all cache
      this.cache.clear();
      return;
    }

    // Clear cache entries matching pattern
    const keysToDelete: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      const keyParts = key.split("|");
      const keyProjectCode = keyParts[0];
      const keyGroupCode = keyParts[1];
      const keyParent = keyParts.find((p) => p.startsWith("parent:"));

      let shouldDelete = false;

      if (pattern.projectCode && keyProjectCode !== pattern.projectCode) {
        continue;
      }
      if (pattern.groupCode && keyGroupCode !== pattern.groupCode) {
        continue;
      }
      if (pattern.parent !== undefined) {
        const parentValue = pattern.parent ?? "null";
        if (keyParent !== `parent:${parentValue}`) {
          continue;
        }
      }

      keysToDelete.push(key);
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
const dropdownCache = new DropdownCacheService();

// Clean up expired entries periodically (every 5 minutes)
if (typeof window !== "undefined") {
  setInterval(() => {
    dropdownCache.clearExpired();
  }, 5 * 60 * 1000);
}

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
 * Fetch dropdown items from Supabase with cache support
 */
export async function fetchDropdownItems(
  params: FetchDropdownParams,
  cacheDuration?: number
): Promise<{ data: DropdownItem[] | null; error: string | null }> {
  // Check cache first
  const cachedData = dropdownCache.get(params, cacheDuration);
  if (cachedData) {
    return { data: cachedData, error: null };
  }

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

    const result = data as DropdownItem[];

    // Cache the result
    if (result && result.length > 0) {
      dropdownCache.set(params, result, cacheDuration);
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to fetch dropdown items:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear dropdown cache
 * @param pattern - Optional pattern to clear specific cache entries
 */
export function clearDropdownCache(pattern?: {
  projectCode?: string;
  groupCode?: string;
  parent?: string | null;
}): void {
  dropdownCache.clear(pattern);
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

  // Get cache duration from config (default 5 minutes)
  const cacheDuration = React.useMemo(() => {
    return config.cacheDuration ?? 300; // 5 minutes default
  }, [config.cacheDuration]);

  // Only re-fetch when relevant dependencies change
  React.useEffect(() => {
    const loadOptions = async () => {
      if (!projectCode || !config.groupCode) {
        setOptions([]);
        return;
      }

      // Check cache first (synchronous check)
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

      // Check cache synchronously first
      const cachedData = dropdownCache.get(params, cacheDuration);
      if (cachedData) {
        // Apply custom filter if provided
        let filteredData = cachedData;
        if (config.filterItems) {
          filteredData = config.filterItems(cachedData);
        }

        // Transform to select options
        const transformFn = config.transformItem || dropdownItemToSelectOption;
        const selectOptions = filteredData.map(transformFn);

        setOptions(selectOptions);
        setLoading(false);
        setError(null);
        return;
      }

      // Cache miss, fetch from API
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await fetchDropdownItems(params, cacheDuration);

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
    config.filterItems,
    config.transformItem,
    parentValue,
    locationCode,
    cacheDuration,
  ]);

  return { options, loading, error };
}


