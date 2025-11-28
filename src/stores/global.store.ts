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
          actions: {},
        }),
        {
          name: "global-storage",
          partialize: (state) => ({
            selectedAdminDivision: state.selectedAdminDivision ?? null,
            selectedLocation: state.selectedLocation ?? null,
            selectedWorkingShift: state.selectedWorkingShift ?? null,
            currentAttendance: state.currentAttendance ?? null,
          }),
          onRehydrateStorage: (state) => {
            if (state) {
              state.selectedAdminDivision = state.selectedAdminDivision ?? null;
              state.selectedLocation = state.selectedLocation ?? null;
              state.selectedWorkingShift = state.selectedWorkingShift ?? null;
              state.currentAttendance = state.currentAttendance ?? null;
            }
          },
        },
      ),
      { name: "GlobalStore" },
    ),
  );
};
