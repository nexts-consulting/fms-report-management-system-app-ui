import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { useQuery } from "react-query";
import { ReportEntry } from "./list";

export type GetReportEntryByIdParams = {
  tableName: string;
  schema?: string;
  id: string;
};

export const httpRequestGetReportEntryById = async (
  params: GetReportEntryByIdParams,
): Promise<ReportEntry> => {
  try {
    const { tableName, id } = params;

    const { data, error } = await supabaseFmsService.client
      .from(tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        throw new Error(
          `Report entry table "${tableName}" does not exist. Please ensure the table has been created.`,
        );
      }

      throw error;
    }

    return data as ReportEntry;
  } catch (error) {
    console.error("Error fetching report entry by id:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestGetReportEntryById;

type QueryOptions = {
  params: GetReportEntryByIdParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryReportEntryById = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/report-entry/get-by-id", params],
    queryFn: () => httpRequestGetReportEntryById(params),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!params.tableName && !!params.id,
    ...config,
  });
};
