import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { ILocation } from "@/types/model";
import { useQuery } from "react-query";

export type HttpRequestLocationByIdParams = {
  id: number;
};

export type LocationByIdResponseData = {
  data: ILocation | null;
};

export const httpRequestLocationById = async (
  params: HttpRequestLocationByIdParams,
): Promise<LocationByIdResponseData> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_locations")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    return { data: data as ILocation };
  } catch (error) {
    console.error("Error fetching location by ID:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestLocationById;

type QueryOptions = {
  params: HttpRequestLocationByIdParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryLocationById = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/location/get-by-id", params],
    queryFn: () => httpRequestLocationById(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.id,
    ...config,
  });
};
