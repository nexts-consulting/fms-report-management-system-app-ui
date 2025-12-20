import { IWorkingShiftLocation, IAttendance } from "@/types/model";
import { IAdminDivision, ILocation } from "@/types/model";
import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  IProjectAuthConfig,
  IProjectCheckinFlow,
  IProjectGpsConfig,
  IProjectAttendancePhotoConfig,
  IProjectWorkshiftConfig,
  IProjectMetadata,
} from "@/types/model";

export type GlobalStore = {
  navigatorOnline: boolean;
  showNavigation: boolean;
  selectedAdminDivision: IAdminDivision | null;
  selectedLocation: ILocation | null;
  selectedWorkingShift: IWorkingShiftLocation | null;
  currentAttendance: IAttendance | null;
  caroColors: [string, string];
  showCheckoutConfirmation: boolean;
  showLogoutConfirmation: boolean;
  showLeaveConfirmation: boolean;
  showLeaveEndConfirmation: boolean;
  // Project configs
  projectMetadata: IProjectMetadata[] | null;
  projectAuthConfig: IProjectAuthConfig | null;
  projectCheckinFlow: IProjectCheckinFlow | null;
  projectGpsConfig: IProjectGpsConfig | null;
  projectAttendancePhotoConfig: IProjectAttendancePhotoConfig | null;
  projectWorkshiftConfig: IProjectWorkshiftConfig | null;
  // Store project ID to validate configs on reload
  currentProjectId: string | null;
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
          selectedAdminDivision: null,
          selectedLocation: null,
          selectedWorkingShift: null,
          currentAttendance: null,
          showCheckoutConfirmation: false,
          showLogoutConfirmation: false,
          showLeaveConfirmation: false,
          showLeaveEndConfirmation: false,
          projectMetadata: null,
          projectAuthConfig: null,
          projectCheckinFlow: null,
          projectGpsConfig: null,
          projectAttendancePhotoConfig: null,
          projectWorkshiftConfig: null,
          currentProjectId: null,
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
              state.projectMetadata = state.projectMetadata ?? null;
              state.projectAuthConfig = state.projectAuthConfig ?? null;
              state.projectCheckinFlow = state.projectCheckinFlow ?? null;
              state.projectGpsConfig = state.projectGpsConfig ?? null;
              state.projectAttendancePhotoConfig = state.projectAttendancePhotoConfig ?? null;
              state.projectWorkshiftConfig = state.projectWorkshiftConfig ?? null;
              state.currentProjectId = state.currentProjectId ?? null;
            }
          },
        },
      ),
      { name: "GlobalStore" },
    ),
  );
};
