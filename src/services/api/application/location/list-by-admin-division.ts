import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { ILocation, GetLocationsParams } from "@/types/model";
import { useQuery } from "react-query";

export type HttpRequestLocationByAdminDivisionParams = {
  project_code: string;
  admin_division_id?: number;
  admin_division_ids?: number[];
};

export type LocationByAdminDivisionResponseData = {
  data: ILocation[];
  count: number;
};

export const httpRequestLocationByAdminDivision = async (
  params: HttpRequestLocationByAdminDivisionParams,
): Promise<LocationByAdminDivisionResponseData> => {
  try {
    let query = supabaseFmsService.client
      .from("fms_mst_locations")
      .select("*")
      .eq("project_code", params.project_code);

    // Use admin_division_ids if provided (includes parent and all children)
    if (params.admin_division_ids && params.admin_division_ids.length > 0) {
      query = query.in("admin_division_id", params.admin_division_ids);
    } else if (params.admin_division_id) {
      // Fallback to single division ID for backward compatibility
      query = query.eq("admin_division_id", params.admin_division_id);
    }

    query = query.order("name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data: data as ILocation[], count: data?.length || 0 };
  } catch (error) {
    console.error("Error fetching locations by admin division:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestLocationByAdminDivision;

type QueryOptions = {
  params: HttpRequestLocationByAdminDivisionParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryLocationByAdminDivision = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/location/list-by-admin-division", params],
    queryFn: () => httpRequestLocationByAdminDivision(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.project_code && (!!params.admin_division_id || (!!params.admin_division_ids && params.admin_division_ids.length > 0)),
    ...config,
  });
};
