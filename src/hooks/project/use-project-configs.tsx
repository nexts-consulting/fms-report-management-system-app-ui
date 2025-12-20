"use client";

import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { httpRequestLoadAllProjectConfigs } from "@/services/api/application/management/projects/configs/load-all";

/**
 * Hook to load and access project configs
 * Automatically loads configs if project is available but configs are not loaded
 */
export const useProjectConfigs = () => {
  const authStore = useAuthContext();
  const globalStore = useGlobalContext();

  const project = authStore.use.project();
  const projectMetadata = globalStore.use.projectMetadata();
  const projectAuthConfig = globalStore.use.projectAuthConfig();
  const projectCheckinFlow = globalStore.use.projectCheckinFlow();
  const projectGpsConfig = globalStore.use.projectGpsConfig();
  const projectAttendancePhotoConfig = globalStore.use.projectAttendancePhotoConfig();
  const projectWorkshiftConfig = globalStore.use.projectWorkshiftConfig();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Auto-load configs if project exists but configs are not loaded
  React.useEffect(() => {
    const loadConfigs = async () => {
      if (!project?.id) {
        return;
      }

      const currentProjectId = globalStore.getState().currentProjectId;

      // Check if project ID changed - if so, clear old configs
      if (currentProjectId && currentProjectId !== project.id) {
        globalStore.setState({
          projectMetadata: undefined,
          projectAuthConfig: undefined,
          projectCheckinFlow: undefined,
          projectGpsConfig: undefined,
          projectAttendancePhotoConfig: undefined,
          projectWorkshiftConfig: undefined,
          currentProjectId: project.id,
        });
      }

      // Check if any config is missing (considering metadata can be empty array)
      const hasConfigs =
        projectMetadata !== undefined &&
        projectAuthConfig !== undefined &&
        projectCheckinFlow !== undefined &&
        projectGpsConfig !== undefined &&
        projectAttendancePhotoConfig !== undefined &&
        projectWorkshiftConfig !== undefined;

      // If configs are loaded but project ID doesn't match, reload
      const configsMatchProject = !currentProjectId || currentProjectId === project.id;

      if ((!hasConfigs || !configsMatchProject) && !isLoading) {
        setIsLoading(true);
        setError(null);

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
          setError(err instanceof Error ? err : new Error("Failed to load project configs"));
        } finally {
          setIsLoading(false);
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
    isLoading,
    globalStore,
  ]);

  /**
   * Manually reload all project configs
   */
  const reloadConfigs = React.useCallback(async () => {
    if (!project?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

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
      console.error("Error reloading project configs:", err);
      setError(err instanceof Error ? err : new Error("Failed to reload project configs"));
    } finally {
      setIsLoading(false);
    }
  }, [project?.id, globalStore]);

  /**
   * Get metadata value by key
   */
  const getMetadataValue = React.useCallback(
    (key: string): string | null => {
      const metadata = projectMetadata?.find((m) => m.key === key);
      return metadata?.value || null;
    },
    [projectMetadata],
  );

  /**
   * Get metadata object by key
   */
  const getMetadata = React.useCallback(
    (key: string) => {
      return projectMetadata?.find((m) => m.key === key) || null;
    },
    [projectMetadata],
  );

  return {
    // Configs
    projectMetadata,
    projectAuthConfig,
    projectCheckinFlow,
    projectGpsConfig,
    projectAttendancePhotoConfig,
    projectWorkshiftConfig,
    // State
    isLoading,
    error,
    // Methods
    reloadConfigs,
    getMetadataValue,
    getMetadata,
    // Check if all configs are loaded
    isLoaded:
      projectMetadata !== undefined &&
      projectAuthConfig !== undefined &&
      projectCheckinFlow !== undefined &&
      projectGpsConfig !== undefined &&
      projectAttendancePhotoConfig !== undefined &&
      projectWorkshiftConfig !== undefined,
  };
};
