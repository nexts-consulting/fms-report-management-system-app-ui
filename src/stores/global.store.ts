import { IWorkingShift, IStaffAttendance } from "@/types/model";
import { IAdminDivision } from "@/services/application/management/master-data/admin-divisions-fms";
import { ILocation } from "@/services/application/management/master-data/locations-fms";
import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  IProjectAuthConfig,
  IProjectCheckinFlow,
  IProjectGpsConfig,
  IProjectAttendancePhotoConfig,
  IProjectWorkshiftConfig,
  IProjectMetadata,
} from "@/services/application/management/projects/configs/types";

export type GlobalStore = {
  navigatorOnline: boolean;
  showNavigation: boolean;
  selectedAdminDivision: IAdminDivision | null | undefined;
  selectedLocation: ILocation | null | undefined;
  selectedWorkingShift: IWorkingShift | null | undefined;
  currentAttendance: IStaffAttendance | null | undefined;
  caroColors: [string, string];
  showCheckoutConfirmation: boolean;
  showLogoutConfirmation: boolean;
  showLeaveConfirmation: boolean;
  showLeaveEndConfirmation: boolean;
  // Project configs
  projectMetadata: IProjectMetadata[] | null | undefined;
  projectAuthConfig: IProjectAuthConfig | null | undefined;
  projectCheckinFlow: IProjectCheckinFlow | null | undefined;
  projectGpsConfig: IProjectGpsConfig | null | undefined;
  projectAttendancePhotoConfig: IProjectAttendancePhotoConfig | null | undefined;
  projectWorkshiftConfig: IProjectWorkshiftConfig | null | undefined;
  // Store project ID to validate configs on reload
  currentProjectId: string | null | undefined;
};

export const createGlobalStore = () => {
  return createStore<GlobalStore>()(
    devtools(
      persist(
        (set) => ({
          caroColors: ["#050ba9", "#47c9fa"],
          timeoutIds: [],
          navigatorOnline: true,
          showNavigation: false,
          selectedAdminDivision: undefined,
          selectedLocation: undefined,
          selectedWorkingShift: undefined,
          currentAttendance: undefined,
          showCheckoutConfirmation: false,
          showLogoutConfirmation: false,
          showLeaveConfirmation: false,
          showLeaveEndConfirmation: false,
          projectMetadata: undefined,
          projectAuthConfig: undefined,
          projectCheckinFlow: undefined,
          projectGpsConfig: undefined,
          projectAttendancePhotoConfig: undefined,
          projectWorkshiftConfig: undefined,
          currentProjectId: undefined,
          actions: {},
        }),
        {
          name: "global-storage",
          partialize: (state) => ({
            selectedAdminDivision: state.selectedAdminDivision ?? null,
            selectedLocation: state.selectedLocation ?? null,
            selectedWorkingShift: state.selectedWorkingShift ?? null,
            currentAttendance: state.currentAttendance ?? null,
            // Persist project configs to local storage along with project ID
            projectMetadata: state.projectMetadata ?? null,
            projectAuthConfig: state.projectAuthConfig ?? null,
            projectCheckinFlow: state.projectCheckinFlow ?? null,
            projectGpsConfig: state.projectGpsConfig ?? null,
            projectAttendancePhotoConfig: state.projectAttendancePhotoConfig ?? null,
            projectWorkshiftConfig: state.projectWorkshiftConfig ?? null,
            currentProjectId: state.currentProjectId ?? null,
          }),
          onRehydrateStorage: (state) => {
            if (state) {
              state.selectedAdminDivision = state.selectedAdminDivision ?? null;
              state.selectedLocation = state.selectedLocation ?? null;
              state.selectedWorkingShift = state.selectedWorkingShift ?? null;
              state.currentAttendance = state.currentAttendance ?? null;
              // Restore project configs from local storage
              state.projectMetadata = state.projectMetadata ?? undefined;
              state.projectAuthConfig = state.projectAuthConfig ?? undefined;
              state.projectCheckinFlow = state.projectCheckinFlow ?? undefined;
              state.projectGpsConfig = state.projectGpsConfig ?? undefined;
              state.projectAttendancePhotoConfig = state.projectAttendancePhotoConfig ?? undefined;
              state.projectWorkshiftConfig = state.projectWorkshiftConfig ?? undefined;
              state.currentProjectId = state.currentProjectId ?? undefined;
            }
          },
        },
      ),
      { name: "GlobalStore" },
    ),
  );
};
