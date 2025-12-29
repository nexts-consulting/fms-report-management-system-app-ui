import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { supabaseFmsService } from "@/services/supabase";
import { useQuery } from "react-query";

export type ListReportEntriesParams = {
  tableName: string;
  schema?: string;
  date?: string;
  page?: number;
  size?: number;
};

export type ReportEntry = {
  id: string;
  unique_value: string;
  data: Record<string, any>;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type ListReportEntriesResponse = {
  data: ReportEntry[];
  total?: number;
};

/**
 * List report entries from the specified table
 * 
 * @param params - Parameters for listing report entries
 * @returns List of report entries
 */
export const httpRequestListReportEntries = async (
  params: ListReportEntriesParams,
): Promise<ListReportEntriesResponse> => {
  try {
    const { tableName, schema, date, page = 0, size = 10 } = params;

    let query = supabaseFmsService.client
      .from(tableName)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Filter by date if provided
    if (date) {
      const startDate = `${date}T00:00:00.000Z`;
      const endDate = `${date}T23:59:59.999Z`;
      query = query
        .gte("created_at", startDate)
        .lte("created_at", endDate);
    }

    // Pagination
    const from = page * size;
    const to = from + size - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      // If table doesn't exist, provide helpful error message
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        throw new Error(
          `Report entry table "${tableName}" does not exist. Please ensure the table has been created.`,
        );
      }
      throw error;
    }

    return {
      data: (data || []) as ReportEntry[],
      total: count || 0,
    };
  } catch (error) {
    console.error("Error listing report entries:", error);
    throw error;
  }
};

type QueryFnType = typeof httpRequestListReportEntries;

type QueryOptions = {
  params: ListReportEntriesParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryReportEntries = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/report-entries/list", params],
    queryFn: () => httpRequestListReportEntries(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.tableName,
    ...config,
  });
};

