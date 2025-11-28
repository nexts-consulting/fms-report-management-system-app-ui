import {
  httpRequestGetProjectMetadata,
  httpRequestGetProjectAuthConfig,
  httpRequestGetProjectCheckinFlow,
  httpRequestGetProjectGpsConfig,
  httpRequestGetProjectAttendancePhotoConfig,
  httpRequestGetProjectWorkshiftConfig,
} from "./index";
import type {
  IProjectMetadata,
  IProjectAuthConfig,
  IProjectCheckinFlow,
  IProjectGpsConfig,
  IProjectAttendancePhotoConfig,
  IProjectWorkshiftConfig,
} from "./types";

/**
 * Interface for all project configs
 */
export interface IProjectAllConfigs {
  metadata: IProjectMetadata[];
  authConfig: IProjectAuthConfig | null;
  checkinFlow: IProjectCheckinFlow | null;
  gpsConfig: IProjectGpsConfig | null;
  attendancePhotoConfig: IProjectAttendancePhotoConfig | null;
  workshiftConfig: IProjectWorkshiftConfig | null;
}

/**
 * Load all project configurations at once
 * @param projectId - Project ID
 * @returns All project configs
 */
export const httpRequestLoadAllProjectConfigs = async (
  projectId: string,
): Promise<IProjectAllConfigs> => {
  try {
    // Load all configs in parallel for better performance
    const [metadata, authConfig, checkinFlow, gpsConfig, photoConfig, workshiftConfig] =
      await Promise.all([
        httpRequestGetProjectMetadata(projectId),
        httpRequestGetProjectAuthConfig(projectId),
        httpRequestGetProjectCheckinFlow(projectId),
        httpRequestGetProjectGpsConfig(projectId),
        httpRequestGetProjectAttendancePhotoConfig(projectId),
        httpRequestGetProjectWorkshiftConfig(projectId),
      ]);

    return {
      metadata: metadata || [],
      authConfig,
      checkinFlow,
      gpsConfig,
      attendancePhotoConfig: photoConfig,
      workshiftConfig,
    };
  } catch (error) {
    console.error("Error loading all project configs:", error);
    throw error;
  }
};

