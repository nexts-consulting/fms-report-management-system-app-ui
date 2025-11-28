import { IOutlet, IProvince, IWorkingShift, IStaffAttendance } from "@/types/model";
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
  selectedProvince: IProvince | null | undefined;
  selectedOutlet: IOutlet | null | undefined;
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
          selectedProvince: undefined,
          selectedOutlet: undefined,
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
            selectedProvince: state.selectedProvince ?? null,
            selectedOutlet: state.selectedOutlet ?? null,
            selectedWorkingShift: state.selectedWorkingShift ?? null,
            currentAttendance: state.currentAttendance ?? null,
          }),
          onRehydrateStorage: (state) => {
            if (state) {
              state.selectedProvince = state.selectedProvince ?? null;
              state.selectedOutlet = state.selectedOutlet ?? null;
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
