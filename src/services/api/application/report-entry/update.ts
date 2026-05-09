import { useMutation } from "react-query";
import { supabaseFmsService } from "@/services/supabase";
import { ReportEntry } from "./list";

export type UpdateReportEntryParams = {
  tableName: string;
  schema?: string;
  id: string;
  data: Record<string, any>;
  updatedBy: string;
};

export const httpRequestUpdateReportEntry = async (
  params: UpdateReportEntryParams,
): Promise<ReportEntry> => {
  try {
    const { tableName, id, data, updatedBy } = params;

    const { data: updatedData, error } = await supabaseFmsService.client
      .from(tableName)
      .update({
        data,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        throw new Error(
          `Report entry table "${tableName}" does not exist. Please ensure the table has been created.`,
        );
      }

      throw error;
    }

    return updatedData as ReportEntry;
  } catch (error) {
    console.error("Error updating report entry:", error);
    throw error;
  }
};

type UseMutationUpdateReportEntryOptions = {
  config?: {
    onSuccess?: (
      data: ReportEntry,
      variables: UpdateReportEntryParams,
      context: unknown,
    ) => void | Promise<unknown>;
    onError?: (
      error: Error,
      variables: UpdateReportEntryParams,
      context: unknown,
    ) => void | Promise<unknown>;
    onSettled?: (
      data: ReportEntry | undefined,
      error: Error | null,
      variables: UpdateReportEntryParams,
      context: unknown,
    ) => void | Promise<unknown>;
  };
};

export const useMutationUpdateReportEntry = ({
  config,
}: UseMutationUpdateReportEntryOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestUpdateReportEntry,
    retry: 1,
    ...config,
  });
};
