import { supabaseMasterService } from "@/services/supabase";
import type {
  IProjectMetadata,
  IProjectAuthConfig,
  IProjectCheckinFlow,
  IProjectGpsConfig,
  IProjectAttendancePhotoConfig,
  IProjectWorkshiftConfig,
} from "@/types/model";

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

