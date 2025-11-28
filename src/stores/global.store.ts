import { IOutlet, IProvince, IWorkingShift, IStaffAttendance } from "@/types/model";
import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";

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
