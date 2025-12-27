import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { IReportDefinition } from "@/types/model";
import { useQuery } from "react-query";

export type HttpRequestReportDefinitionPreviewByCodeParams = {
  tenantCode: string;
  projectCode: string;
  code: string;
}

export type ReportDefinitionPreviewByCodeResponseData = {
  data: IReportDefinition | null;
}

export const httpRequestReportDefinitionPreviewByCode = async (
  params: HttpRequestReportDefinitionPreviewByCodeParams,
): Promise<ReportDefinitionPreviewByCodeResponseData> => {
  try {
    const { data, error } = await supabaseFmsService.client
      .from("fms_mst_report_definition")
      .select("*")
      .eq("tenant_code", params.tenantCode)
      .eq("project_code", params.projectCode)
      .eq("code", params.code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { data: null };
      }
      throw error;
    }

    return { data: data as IReportDefinition };
  } catch (error) {
    console.error("Error fetching report definition preview by code:", error);
    throw error;
  }
}


type QueryFnType = typeof httpRequestReportDefinitionPreviewByCode;

type QueryOptions = {
  params: HttpRequestReportDefinitionPreviewByCodeParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryReportDefinitionPreviewByCode = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/report-definition/get-preview-by-code", params],
    queryFn: () => httpRequestReportDefinitionPreviewByCode(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.projectCode && !!params.code,
    ...config,
  });
}