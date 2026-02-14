import { supabaseFmsService } from "@/services/supabase";
import dayjs from "dayjs";

export type DataSourceConfig = {
  schema?: string;
  table_name: string;
  primary_key?: string;
};

export type CreateReportEntryParams = {
  tableName: string;
  schema?: string;
  data: Record<string, any>;
  uniqueValue?: string;
  createdBy: string;
  additionalData1?: Record<string, any>;
  additionalData2?: Record<string, any>;
  workshiftId?: number;
  workshiftName?: string;
  locationCode?: string;
  locationName?: string;
  attendanceId?: string;
};

export type CreateReportEntryResponse = {
  id: string;
  unique_value: string;
  entry_label: string;
  data: Record<string, any>;
  additional_data_1: Record<string, any>;
  additional_data_2: Record<string, any>;
  workshift_id: number;
  workshift_name: string;
  location_code: string;
  location_name: string;
  attendance_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

/**
 * Create a new report entry
 * Inserts data into the table specified in data_source_config
 *
 * @param params - Parameters for creating report entry
 * @returns Created report entry
 */
export const httpRequestCreateReportEntry = async (
  params: CreateReportEntryParams,
): Promise<CreateReportEntryResponse> => {
  try {
    const {
      tableName,
      schema,
      data,
      uniqueValue,
      createdBy,
      additionalData1,
      additionalData2,
      workshiftId,
      workshiftName,
      locationCode,
      locationName,
      attendanceId,
    } = params;

    // Generate unique_value if not provided
    const finalUniqueValue = uniqueValue || dayjs().format("YYYYMMDDHHmmssSSS");

    // Prepare insert data
    const insertData: Record<string, any> = {
      unique_value: finalUniqueValue,
      entry_label: "",
      data: data,
      additional_data_1: additionalData1,
      additional_data_2: additionalData2,
      workshift_id: workshiftId,
      workshift_name: workshiftName,
      location_code: locationCode,
      location_name: locationName,
      attendance_id: attendanceId,
      created_by: createdBy,
    };

    // Build table reference with schema if provided
    const tableReference = schema ? `${schema}.${tableName}` : tableName;

    // Insert data into the table
    // Note: Supabase client uses .from() which doesn't support schema prefix directly
    // We'll use the table name directly and let Supabase handle it
    const { data: insertedData, error } = await supabaseFmsService.client
      .from(tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // If table doesn't exist, provide helpful error message
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        throw new Error(
          `Report entry table "${tableName}" does not exist. Please ensure the table has been created.`,
        );
      }
      throw error;
    }

    return insertedData as CreateReportEntryResponse;
  } catch (error) {
    console.error("Error creating report entry:", error);
    throw error;
  }
};
