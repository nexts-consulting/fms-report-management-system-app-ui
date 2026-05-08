import { useMutation } from "react-query";
import { supabaseFmsService } from "@/services/supabase";

export type DeleteReportEntryParams = {
  tableName: string;
  schema?: string;
  id: string;
};

export type DeleteReportEntryResponse = {
  success: boolean;
  id: string;
};

export const httpRequestDeleteReportEntry = async (
  params: DeleteReportEntryParams,
): Promise<DeleteReportEntryResponse> => {
  try {
    const { tableName, id } = params;

    const { error } = await supabaseFmsService.client.from(tableName).delete().eq("id", id);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        throw new Error(
          `Report entry table "${tableName}" does not exist. Please ensure the table has been created.`,
        );
      }

      throw error;
    }

    return { success: true, id };
  } catch (error) {
    console.error("Error deleting report entry:", error);
    throw error;
  }
};

type UseMutationDeleteReportEntryOptions = {
  config?: {
    onSuccess?: (
      data: DeleteReportEntryResponse,
      variables: DeleteReportEntryParams,
      context: unknown,
    ) => void | Promise<unknown>;
    onError?: (
      error: Error,
      variables: DeleteReportEntryParams,
      context: unknown,
    ) => void | Promise<unknown>;
    onSettled?: (
      data: DeleteReportEntryResponse | undefined,
      error: Error | null,
      variables: DeleteReportEntryParams,
      context: unknown,
    ) => void | Promise<unknown>;
  };
};

export const useMutationDeleteReportEntry = ({
  config,
}: UseMutationDeleteReportEntryOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestDeleteReportEntry,
    retry: 1,
    ...config,
  });
};
