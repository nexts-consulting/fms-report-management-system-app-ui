import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import {
  httpRequestGetLocations,
  ILocation,
  GetLocationsParams,
} from "@/services/application/management/master-data/locations-fms";
import { useQuery } from "react-query";

type HttpRequestLocationByAdminDivisionParams = {
  project_code: string;
  admin_division_id?: number;
  admin_division_ids?: number[];
};

type LocationByAdminDivisionResponseData = {
  data: ILocation[];
  count: number;
};

const httpRequestLocationByAdminDivision = async (
  params: HttpRequestLocationByAdminDivisionParams,
): Promise<LocationByAdminDivisionResponseData> => {
  try {
    const queryParams: GetLocationsParams = {
      project_code: params.project_code,
    };

    // Use admin_division_ids if provided (includes parent and all children)
    if (params.admin_division_ids && params.admin_division_ids.length > 0) {
      queryParams.admin_division_ids = params.admin_division_ids;
    } else if (params.admin_division_id) {
      // Fallback to single division ID for backward compatibility
      queryParams.admin_division_id = params.admin_division_id;
    }

    const result = await httpRequestGetLocations(queryParams);
    return {
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestLocationByAdminDivision;

type QueryOptions = {
  params: HttpRequestLocationByAdminDivisionParams;
  config?: QueryConfig<QueryFnType>;
};

const useQueryLocationByAdminDivision = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/location/list-by-admin-division", params],
    queryFn: () => httpRequestLocationByAdminDivision(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.project_code && !!params.admin_division_id,
    ...config,
  });
};

export { httpRequestLocationByAdminDivision, useQueryLocationByAdminDivision };
export type { LocationByAdminDivisionResponseData };

