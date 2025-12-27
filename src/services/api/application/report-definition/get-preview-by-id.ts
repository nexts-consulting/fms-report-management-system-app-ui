import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { IReportDefinition } from "@/types/model";
import { useQuery } from "react-query";

export type HttpRequestReportDefinitionPreviewByIdParams = {
  id: string;
}

export type ReportDefinitionPreviewByCodeResponseData = {
  data: IReportDefinition | null;
}

export const httpRequestReportDefinitionPreviewByCode = async (
  params: HttpRequestReportDefinitionPreviewByIdParams,
): Promise<ReportDefinitionPreviewByCodeResponseData> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_report_definition")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    return { data: data as IReportDefinition };
  } catch (error) {
    console.error("Error fetching report definition preview by id:", error);
    throw error;
  }
}


type QueryFnType = typeof httpRequestReportDefinitionPreviewByCode;

type QueryOptions = {
  params: HttpRequestReportDefinitionPreviewByIdParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryReportDefinitionPreviewById = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/report-definition/get-preview-by-id", params],
    queryFn: () => httpRequestReportDefinitionPreviewByCode(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.id,
    ...config,
  });
}