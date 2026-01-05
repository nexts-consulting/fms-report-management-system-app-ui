import { createStore } from "zustand";
import { TLocalStore } from "../types";
import { LocationSummary } from "../ui/summary/location-summary";
import { ShiftSummary } from "../ui/summary/shift-summary";
import { SummaryTabKey } from "../enums";
import { Icons } from "@/kits/components/icons";

export const createLocalStore = (
  init: Pick<
    TLocalStore,
    "lng" | "user" | "location" | "shift" | "loading" | "onUpdateGps" | "onContinue" | "gpsConfig"
  >,
) => {
  return createStore<TLocalStore>(() => ({
    ...init,
    gpsConfig: init.gpsConfig ?? undefined,
    isExpandedSummary: false,
    summaryTabs: [
      {
        key: SummaryTabKey.LOCATION,
        icon: Icons.Location,
        tabElement: LocationSummary,
      },
      {
        key: SummaryTabKey.SHIFT,
        icon: Icons.TaskLocation,
        tabElement: ShiftSummary,
      },
    ],
    activeSummaryTabIdx: 0,
    isMapReady: false,
    activeSummaryTabKey: undefined,
    activeSummaryTab: undefined,
    isUserInLocationScope: false,
    isShowMembersLayer: false,
  }));
};
