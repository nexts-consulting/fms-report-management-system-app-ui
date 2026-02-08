import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { IFormDefinition } from "@/types/model";
import { useQuery } from "react-query";

export type HttpRequestFormDefinitionByIdParams = {
  id: string;
}

export type FormDefinitionByIdResponseData = {
  data: IFormDefinition | null;
}

export const httpRequestFormDefinitionById = async (
  params: HttpRequestFormDefinitionByIdParams,
): Promise<FormDefinitionByIdResponseData> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_form_definition")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    return { data: data as IFormDefinition };
  } catch (error) {
    console.error("Error fetching form definition by id:", error);
    throw error;
  }
}


type QueryFnType = typeof httpRequestFormDefinitionById;

type QueryOptions = {
  params: HttpRequestFormDefinitionByIdParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryFormDefinitionById = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/form-definition/get-by-id", params],
    queryFn: () => httpRequestFormDefinitionById(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.id,
    ...config,
  });
}




