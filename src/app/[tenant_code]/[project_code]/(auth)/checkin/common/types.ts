import type { IProjectCheckinFlow, IWorkshift } from "@/types/model";

export type CheckinStep = "survey" | "pre_shift_task" | "gps" | "capture" | "submit" | "post_shift_task";

export interface UserGeolocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface CheckinLocation {
  lat: number;
  lng: number;
  acc: number;
}

export interface CheckinFlowContext {
  checkinFlow: IProjectCheckinFlow | null | undefined;
  workingShift: IWorkshift | null | undefined;
  userGeolocation: UserGeolocation | null;
}

