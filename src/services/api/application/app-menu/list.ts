import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { useQuery } from "react-query";
import { IAppMenu } from "@/types/model";
import React from "react";

/**
 * Get all app menus for a project (only menu_type = "APP")
 * 
 * @param projectCode - Project code to filter menus
 * @returns List of app menus
 */
export const httpRequestGetAppMenus = async (
  projectCode: string,
): Promise<IAppMenu[]> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_app_menus")
      .select("*")
      .eq("project_code", projectCode)
      .eq("menu_type", "APP")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as IAppMenu[];
  } catch (error) {
    console.error("Error fetching app menus:", error);
    throw error;
  }
};

/**
 * LocalStorage cache utilities for app menus
 */
const getLocalStorageKey = (projectCode: string) => `app-menus-${projectCode}`;

export const getCachedAppMenus = (projectCode: string): IAppMenu[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(getLocalStorageKey(projectCode));
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed;
    }
  } catch (error) {
    console.error("Error reading cached app menus:", error);
  }
  return null;
};

export const setCachedAppMenus = (projectCode: string, menus: IAppMenu[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getLocalStorageKey(projectCode), JSON.stringify(menus));
  } catch (error) {
    console.error("Error caching app menus:", error);
  }
};

export const clearCachedAppMenus = (projectCode: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getLocalStorageKey(projectCode));
  } catch (error) {
    console.error("Error clearing cached app menus:", error);
  }
};

type QueryFnType = typeof httpRequestGetAppMenus;

type QueryOptions = {
  params: {
    projectCode: string;
  };
  config?: QueryConfig<QueryFnType>;
};

/**
 * React Query hook to get app menus with caching
 * Uses localStorage for initial data and React Query for cache management
 */
export const useQueryAppMenus = ({ params, config }: QueryOptions) => {
  const { projectCode } = params;

  // Get initial data from localStorage
  const initialData = React.useMemo(() => {
    return getCachedAppMenus(projectCode) ?? undefined;
  }, [projectCode]);

  // Clear cache when project code changes (cleanup effect)
  const prevProjectCodeRef = React.useRef<string | undefined>(projectCode);
  React.useEffect(() => {
    const currentProjectCode = projectCode;
    const prevProjectCode = prevProjectCodeRef.current;

    if (prevProjectCode && prevProjectCode !== currentProjectCode) {
      clearCachedAppMenus(prevProjectCode);
    }

    prevProjectCodeRef.current = currentProjectCode;
  }, [projectCode]);

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["app-menus", projectCode],
    queryFn: async () => {
      // Fetch from API
      const menus = await httpRequestGetAppMenus(projectCode);
      // Save to localStorage after successful fetch
      setCachedAppMenus(projectCode, menus);
      return menus;
    },
    enabled: !!projectCode,
    staleTime: 30 * 60 * 1000, // 30 minutes - data is considered fresh for 30 minutes
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours - cache in memory for 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch when component remounts if data already exists
    initialData, // Use localStorage as initialData for instant display
    ...config,
  });
};

