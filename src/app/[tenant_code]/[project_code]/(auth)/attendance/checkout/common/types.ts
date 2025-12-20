import type { IProjectCheckinFlow } from "@/types/model";

export type CheckoutStep = "gps" | "capture" | "submit";

export interface UserGeolocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface CheckoutLocation {
  lat: number;
  lng: number;
  acc: number;
}

// Export for use in service
export type { CheckoutLocation };

export interface CheckoutFlowContext {
  checkinFlow: IProjectCheckinFlow | null | undefined;
  userGeolocation: UserGeolocation | null;
}
