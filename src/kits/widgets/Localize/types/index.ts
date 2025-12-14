export type TLocalStore = {
  // Props
  lng: TLanguage;
  user: TUser | null | undefined;
  location: TLocation | null | undefined;
  shift: TShift | null | undefined;
  loading: boolean;
  onUpdateGps: (e: { isUserInLocationScope: boolean | undefined }) => void;
  onContinue: () => void;
  // GPS config for controlling continue button visibility
  gpsConfig?:
    | {
        mode?:
          | "REQUIRED_AT_LOCATION"
          | "REQUIRED_BUT_NOT_STRICT"
          | "VISIBLE_OPTIONAL"
          | "NOT_REQUIRED";
        is_required?: boolean;
      }
    | null
    | undefined;

  // States
  isExpandedSummary: boolean;
  summaryTabs: TSummaryTab[];
  activeSummaryTabIdx: number;
  isMapReady: boolean;

  // Computed states
  activeSummaryTabKey: string | undefined;
  activeSummaryTab: TSummaryTab | undefined;
  isUserInLocationScope: boolean;
};

export type TLanguage = "en" | "jp" | "vn";

export type TGPS = {
  lat: number;
  lng: number;
};

export type TUser = {
  id: string;
  avatar: string;
  gps: TGPS;
};

export type TLocation = {
  name: string;
  province: string;
  address: string;
  gps: TGPS;
  radius: number;
};

export type TShift = {
  name: string;
  startTime: Date;
  endTime: Date;
};

export type TSummaryTab = {
  key: string;
  icon: React.ElementType;
  tabElement: React.ElementType;
};

export type TEventUpdateGpsMessage = {
  isUserInLocationScope: boolean | undefined;
};
