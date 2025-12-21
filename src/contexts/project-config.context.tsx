"use client";

import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { httpRequestLoadAllProjectConfigs } from "@/services/api/application/management/projects/configs/load-all";

interface ProjectConfigProviderProps {
  children: React.ReactNode;
}

/**
 * Provider to automatically check and load project configs when missing
 * This ensures configs are always available even if localStorage is cleared
 */
export const ProjectConfigProvider = (props: ProjectConfigProviderProps) => {
  const { children } = props;
  const authStore = useAuthContext();
  const globalStore = useGlobalContext();

  const project = authStore.use.project();
  const projectMetadata = globalStore.use.projectMetadata();
  const projectAuthConfig = globalStore.use.projectAuthConfig();
  const projectCheckinFlow = globalStore.use.projectCheckinFlow();
  const projectGpsConfig = globalStore.use.projectGpsConfig();
  const projectAttendancePhotoConfig = globalStore.use.projectAttendancePhotoConfig();
  const projectWorkshiftConfig = globalStore.use.projectWorkshiftConfig();
  const currentProjectId = globalStore.use.currentProjectId();

  const loadingRef = React.useRef(false);

  // Auto-load configs if project exists but configs are missing or don't match
  React.useEffect(() => {
    const loadConfigs = async () => {
      // Skip if no project
      if (!project?.id) {
        return;
      }

      // Skip if already loading
      if (loadingRef.current) {
        return;
      }

      // Check if project ID changed - if so, clear old configs
      if (currentProjectId && currentProjectId !== project.id) {
        globalStore.setState({
          projectMetadata: undefined,
          projectAuthConfig: null,
          projectCheckinFlow: null,
          projectGpsConfig: null,
          projectAttendancePhotoConfig: null,
          projectWorkshiftConfig: null,
          currentProjectId: project.id,
        });
      }

      // Check if any config is missing (considering metadata can be empty array)
      const hasConfigs =
        projectMetadata !== null &&
        projectAuthConfig !== null &&
        projectCheckinFlow !== null &&
        projectGpsConfig !== null &&
        projectAttendancePhotoConfig !== null &&
        projectWorkshiftConfig !== null;

      // If configs are loaded but project ID doesn't match, reload
      const configsMatchProject = !currentProjectId || currentProjectId === project.id;

      // Load configs if missing or don't match current project
      if (!hasConfigs || !configsMatchProject) {
        loadingRef.current = true;

        try {
          const allConfigs = await httpRequestLoadAllProjectConfigs(project.id);
          globalStore.setState({
            projectMetadata: allConfigs.metadata,
            projectAuthConfig: allConfigs.authConfig,
            projectCheckinFlow: allConfigs.checkinFlow,
            projectGpsConfig: allConfigs.gpsConfig,
            projectAttendancePhotoConfig: allConfigs.attendancePhotoConfig,
            projectWorkshiftConfig: allConfigs.workshiftConfig,
            currentProjectId: project.id,
          });
        } catch (err) {
          console.error("Error loading project configs:", err);
        } finally {
          loadingRef.current = false;
        }
      } else if (!currentProjectId && hasConfigs) {
        // Update project ID if configs exist but ID is not set
        globalStore.setState({
          currentProjectId: project.id,
        });
      }
    };

    loadConfigs();
  }, [
    project?.id,
    projectMetadata,
    projectAuthConfig,
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    projectWorkshiftConfig,
    currentProjectId,
    globalStore,
  ]);

  return <>{children}</>;
};







