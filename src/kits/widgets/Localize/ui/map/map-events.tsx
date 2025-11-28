import React from "react";
import { constants, MapConfig } from "../../constants";
import { useLocalContext } from "../../contexts/local.context";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { LocalEventName } from "../../enums";
import { TEventUpdateGpsMessage } from "../../types";

interface MapEventsProps {}

export const MapEvents = React.memo((props: MapEventsProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;
  const localEventBus = localContext.eventBus;

  const user = localStore.use.user();
  const location = localStore.use.location();

  const isFirsttimeUserHasLocation = React.useRef(false);

  const map = useMap();

  const handleEventMapRecenter = React.useCallback(() => {
    if (!user && !location) {
      return;
    }

    const coordinatesArray = [];

    let bounds = L.latLngBounds([]);

    if (user && location) {
      const userLatLng = L.latLng(user.gps.lat, user.gps.lng);
      const locationLatLng = L.latLng(location.gps.lat, location.gps.lng);
      const distance = userLatLng.distanceTo(locationLatLng);

      if (distance > location.radius) {
        coordinatesArray.push([user.gps.lat, user.gps.lng] as [number, number]);
        coordinatesArray.push([location.gps.lat, location.gps.lng] as [number, number]);

        bounds = L.latLngBounds(coordinatesArray);
      } else {
        const circle = L.circle([location.gps.lat, location.gps.lng], {
          radius: location.radius,
        }).addTo(map);
        bounds = circle.getBounds();
        map.removeLayer(circle);
      }
    } else if (!user && location) {
      const circle = L.circle([location.gps.lat, location.gps.lng], {
        radius: location.radius,
      }).addTo(map);
      bounds = circle.getBounds();
      map.removeLayer(circle);
    } else if (user && !location) {
      coordinatesArray.push([user.gps.lat, user.gps.lng] as [number, number]);
      bounds = L.latLngBounds(coordinatesArray);
    }

    map.fitBounds(bounds, {
      padding: MapConfig.FITBOUND_PADDING,
    });
    map.fire("zoom");
    map.fire("zoomlevelschange");
  }, [map, user, location]);

  const handleEventUpdateGps = React.useCallback(
    (_e: TEventUpdateGpsMessage) => {
      if (!isFirsttimeUserHasLocation.current && user && location) {
        localEventBus.emit(LocalEventName.MAP_RECENTER);
        isFirsttimeUserHasLocation.current = true;
      }
    },
    [localEventBus, user, location],
  );

  const handleEventMapZoomIn = React.useCallback(() => {
    map.zoomIn(1);
  }, [map]);

  const handleEventMapZoomOut = React.useCallback(() => {
    map.zoomOut(1);
  }, [map]);

  React.useEffect(() => {
    localEventBus.on(LocalEventName.MAP_RECENTER, handleEventMapRecenter);

    return () => {
      localEventBus.off(LocalEventName.MAP_RECENTER, handleEventMapRecenter);
    };
  }, [handleEventMapRecenter]);

  React.useEffect(() => {
    localEventBus.on(LocalEventName.MAP_ZOOM_IN, handleEventMapZoomIn);
    return () => {
      localEventBus.off(LocalEventName.MAP_ZOOM_IN, handleEventMapZoomIn);
    };
  }, [handleEventMapZoomIn]);

  React.useEffect(() => {
    localEventBus.on(LocalEventName.MAP_ZOOM_OUT, handleEventMapZoomOut);
    return () => {
      localEventBus.off(LocalEventName.MAP_ZOOM_OUT, handleEventMapZoomOut);
    };
  }, [handleEventMapZoomOut]);

  React.useEffect(() => {
    localEventBus.on(LocalEventName.UPDATE_GPS, handleEventUpdateGps);

    return () => {
      localEventBus.off(LocalEventName.UPDATE_GPS, handleEventUpdateGps);
    };
  }, [handleEventUpdateGps]);

  return <></>;
});

MapEvents.displayName = `${constants.INSTANCE_NAME}.Map.MapEvents`;
