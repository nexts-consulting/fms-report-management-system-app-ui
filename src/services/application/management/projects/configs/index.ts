import { supabaseMasterService } from "@/services/supabase";
import type {
  IProjectMetadata,
  IProjectAuthConfig,
  IProjectCheckinFlow,
  IProjectGpsConfig,
  IProjectAttendancePhotoConfig,
  IProjectWorkshiftConfig,
  CreateProjectMetadataInput,
  UpdateProjectMetadataInput,
  CreateProjectAuthConfigInput,
  UpdateProjectAuthConfigInput,
  CreateProjectCheckinFlowInput,
  UpdateProjectCheckinFlowInput,
  CreateProjectGpsConfigInput,
  UpdateProjectGpsConfigInput,
  CreateProjectAttendancePhotoConfigInput,
  UpdateProjectAttendancePhotoConfigInput,
  CreateProjectWorkshiftConfigInput,
  UpdateProjectWorkshiftConfigInput,
} from "./types";

// ==================== Project Metadata ====================
export const httpRequestGetProjectMetadata = async (
  projectId: string,
): Promise<IProjectMetadata[]> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_metadata")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as IProjectMetadata[];
  } catch (error) {
    console.error("Error fetching project metadata:", error);
    throw error;
  }
};

export const httpRequestCreateProjectMetadata = async (
  input: CreateProjectMetadataInput,
): Promise<IProjectMetadata> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_metadata")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as IProjectMetadata;
  } catch (error) {
    console.error("Error creating project metadata:", error);
    throw error;
  }
};

export const httpRequestUpdateProjectMetadata = async (
  id: string,
  input: UpdateProjectMetadataInput,
): Promise<IProjectMetadata> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_metadata")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as IProjectMetadata;
  } catch (error) {
    console.error("Error updating project metadata:", error);
    throw error;
  }
};

export const httpRequestDeleteProjectMetadata = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseMasterService.client
      .from("project_metadata")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting project metadata:", error);
    throw error;
  }
};

// ==================== Project Auth Config ====================
export const httpRequestGetProjectAuthConfig = async (
  projectId: string,
): Promise<IProjectAuthConfig | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_auth_config")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as IProjectAuthConfig;
  } catch (error) {
    console.error("Error fetching project auth config:", error);
    throw error;
  }
};

export const httpRequestUpsertProjectAuthConfig = async (
  input: CreateProjectAuthConfigInput,
): Promise<IProjectAuthConfig> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_auth_config")
      .upsert(input, { onConflict: "project_id" })
      .select()
      .single();

    if (error) throw error;
    return data as IProjectAuthConfig;
  } catch (error) {
    console.error("Error upserting project auth config:", error);
    throw error;
  }
};

// ==================== Project Checkin Flow ====================
export const httpRequestGetProjectCheckinFlow = async (
  projectId: string,
): Promise<IProjectCheckinFlow | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_checkin_flow")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as IProjectCheckinFlow;
  } catch (error) {
    console.error("Error fetching project checkin flow:", error);
    throw error;
  }
};

export const httpRequestUpsertProjectCheckinFlow = async (
  input: CreateProjectCheckinFlowInput,
): Promise<IProjectCheckinFlow> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_checkin_flow")
      .upsert(input, { onConflict: "project_id" })
      .select()
      .single();

    if (error) throw error;
    return data as IProjectCheckinFlow;
  } catch (error) {
    console.error("Error upserting project checkin flow:", error);
    throw error;
  }
};

// ==================== Project GPS Config ====================
export const httpRequestGetProjectGpsConfig = async (
  projectId: string,
): Promise<IProjectGpsConfig | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_gps_config")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as IProjectGpsConfig;
  } catch (error) {
    console.error("Error fetching project GPS config:", error);
    throw error;
  }
};

export const httpRequestUpsertProjectGpsConfig = async (
  input: CreateProjectGpsConfigInput,
): Promise<IProjectGpsConfig> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_gps_config")
      .upsert(input, { onConflict: "project_id" })
      .select()
      .single();

    if (error) throw error;
    return data as IProjectGpsConfig;
  } catch (error) {
    console.error("Error upserting project GPS config:", error);
    throw error;
  }
};

// ==================== Project Attendance Photo Config ====================
export const httpRequestGetProjectAttendancePhotoConfig = async (
  projectId: string,
): Promise<IProjectAttendancePhotoConfig | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_attendance_photo_config")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as IProjectAttendancePhotoConfig;
  } catch (error) {
    console.error("Error fetching project attendance photo config:", error);
    throw error;
  }
};

export const httpRequestUpsertProjectAttendancePhotoConfig = async (
  input: CreateProjectAttendancePhotoConfigInput,
): Promise<IProjectAttendancePhotoConfig> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_attendance_photo_config")
      .upsert(input, { onConflict: "project_id" })
      .select()
      .single();

    if (error) throw error;
    return data as IProjectAttendancePhotoConfig;
  } catch (error) {
    console.error("Error upserting project attendance photo config:", error);
    throw error;
  }
};

// ==================== Project Workshift Config ====================
export const httpRequestGetProjectWorkshiftConfig = async (
  projectId: string,
): Promise<IProjectWorkshiftConfig | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_workshift_config")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as IProjectWorkshiftConfig;
  } catch (error) {
    console.error("Error fetching project workshift config:", error);
    throw error;
  }
};

export const httpRequestUpsertProjectWorkshiftConfig = async (
  input: CreateProjectWorkshiftConfigInput,
): Promise<IProjectWorkshiftConfig> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("project_workshift_config")
      .upsert(input, { onConflict: "project_id" })
      .select()
      .single();

    if (error) throw error;
    return data as IProjectWorkshiftConfig;
  } catch (error) {
    console.error("Error upserting project workshift config:", error);
    throw error;
  }
};


