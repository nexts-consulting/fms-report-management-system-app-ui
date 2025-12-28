import { supabaseFmsService } from "@/services/supabase";

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
};

export type CreateReportEntryResponse = {
  id: string;
  unique_value: string;
  data: Record<string, any>;
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
    const { tableName, schema, data, uniqueValue, createdBy } = params;

    // Generate unique_value if not provided (use timestamp + random string)
    const finalUniqueValue =
      uniqueValue ||
      `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Prepare insert data
    const insertData: Record<string, any> = {
      unique_value: finalUniqueValue,
      data: data,
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

