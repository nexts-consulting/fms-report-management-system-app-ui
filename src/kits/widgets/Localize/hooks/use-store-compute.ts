import React from "react";
import { useLocalContext } from "../contexts/local.context";
import L from "leaflet";
import { LocalEventName } from "../enums";
import { TEventUpdateGpsMessage } from "../types";

export function useStoreCompute() {
  const localContext = useLocalContext();
  const localStore = localContext.store;
  const localEventBus = localContext.eventBus;

  const activeSummaryTabIdx = localStore.use.activeSummaryTabIdx();
  const summaryTabs = localStore.use.summaryTabs();
  const user = localStore.use.user();
  const location = localStore.use.location();
  const onUpdateGps = localStore.use.onUpdateGps();
  const isMapReady = localStore.use.isMapReady();

  // Update active summary tab
  React.useEffect(() => {
    const activeSummaryTab = summaryTabs[activeSummaryTabIdx];
    if (activeSummaryTab) {
      localStore.setState({ activeSummaryTab, activeSummaryTabKey: activeSummaryTab.key });
    } else {
      localStore.setState({ activeSummaryTabKey: undefined, activeSummaryTab: undefined });
    }
  }, [activeSummaryTabIdx, summaryTabs]);

  // Check if user is in location scope
  React.useEffect(() => {
    if (user?.gps && location?.gps) {
      const userLatLng = L.latLng(user.gps.lat, user.gps.lng);
      const locationLatLng = L.latLng(location.gps.lat, location.gps.lng);
      const distance = userLatLng.distanceTo(locationLatLng);

      if (distance <= location.radius) {
        localEventBus.emit(LocalEventName.UPDATE_GPS, {
          isUserInLocationScope: true,
        } as TEventUpdateGpsMessage);
        localStore.setState({ isUserInLocationScope: true });
        onUpdateGps({ isUserInLocationScope: true });
        console.log("User is within the outlet scope.");
      } else {
        localEventBus.emit(LocalEventName.UPDATE_GPS, {
          isUserInLocationScope: false,
        } as TEventUpdateGpsMessage);
        localStore.setState({ isUserInLocationScope: false });
        onUpdateGps({ isUserInLocationScope: false });
        console.log("User is outside the outlet scope.");
      }
    } else {
      localEventBus.emit(LocalEventName.UPDATE_GPS, {
        isUserInLocationScope: undefined,
      } as TEventUpdateGpsMessage);
      localStore.setState({ isUserInLocationScope: undefined });
      onUpdateGps({ isUserInLocationScope: undefined });
      console.log("User gps or oulet gps is not available.");
    }
  }, [user, location]);

  // Recenter map when map is ready
  React.useEffect(() => {
    if (isMapReady) {
      localEventBus.emit(LocalEventName.MAP_RECENTER);
    }
  }, [isMapReady]);
}
