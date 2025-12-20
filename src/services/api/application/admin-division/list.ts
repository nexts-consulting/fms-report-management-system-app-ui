import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { IAdminDivision, IAdminDivisionWithChildren } from "@/types/model";
import { useQuery } from "react-query";

export type HttpRequestAdminDivisionListParams = {
  project_code: string;
};

export type AdminDivisionListResponseData = {
  data: IAdminDivision[];
};

export const httpRequestAdminDivisionList = async (
  params: HttpRequestAdminDivisionListParams,
): Promise<AdminDivisionListResponseData> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_admin_divisions")
      .select("*")
      .eq("project_code", params.project_code)
      .order("level", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return { data: (data || []) as IAdminDivision[] };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestAdminDivisionList;

type QueryOptions = {
  params: HttpRequestAdminDivisionListParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryAdminDivisionList = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/admin-division/list", params],
    queryFn: () => httpRequestAdminDivisionList(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.project_code,
    ...config,
  });
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