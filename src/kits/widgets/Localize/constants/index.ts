import { PointExpression } from "leaflet";
import { TLanguage } from "../types";

export const constants = {
  INSTANCE_NAME: "Localize",
  DEFAULT_LANGUAGE: "en" as TLanguage,
  Map: {},
  Summary: {
    MEMBERS_SLIDER_PER_VIEW: 3,
  },
};

export const MapConfig = {
  MAP_URL:
    "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?lang=en&access_token=pk.eyJ1IjoiZ2FlbGR1b25nIiwiYSI6ImNrb2I1eDZ5NzIyMmEyb3MyZDlqeGRnZTAifQ.p_IcJvFNMnFDoym2YaxlGA",
  DEFAULT_CENTER: [40.704730978394785, -74.00149462878609],
  DEFAULT_ZOOM: 12,
  ZOOM_SNAP: 0.1,
  FITBOUND_PADDING: [50, 50] as PointExpression,
};

export const LocationMarkerConfig = {
  MARKER_SIZE: 56,
  MARKER_ZINDEX_BASE: 100,
};

export const UserMarkerConfig = {
  MARKER_SIZE: 56,
  MARKER_ZINDEX_BASE: 1000,
};

export const MemberMarkerConfig = {
  MARKER_SIZE: 56,
  MARKER_ZINDEX_BASE: 500,
};
