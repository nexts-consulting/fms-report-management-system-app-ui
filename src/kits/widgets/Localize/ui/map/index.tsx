import React from "react";
import { constants, MapConfig } from "../../constants";
import { MapContainer, TileLayer } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { MapResizer } from "./map-resizer";
import { LocationMarker } from "./location-marker";
import { MapEvents } from "./map-events";
import { useLocalContext } from "../../contexts/local.context";
import { UserMarker } from "./user-marker";
import { MapControls } from "./map-controls";
import { ContinueButton } from "./continue-button";
import "leaflet/dist/leaflet.css";

export interface MapProps {}

export const Map = React.memo((props: MapProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const handleMapReady = React.useCallback(() => {
    localStore.setState({ isMapReady: true });
  }, []);

  return (
    <div className="relative z-[1] mb-[-2px] mt-[-2px] w-full flex-1">
      <MapContainer
        center={MapConfig.DEFAULT_CENTER as LatLngTuple}
        zoom={MapConfig.DEFAULT_ZOOM}
        zoomSnap={MapConfig.ZOOM_SNAP}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        attributionControl={false}
        zoomControl={false}
        whenReady={handleMapReady}
      >
        <TileLayer url={MapConfig.MAP_URL} />
        <MapResizer />
        <MapEvents />

        <LocationMarker />
        <UserMarker />
      </MapContainer>

      <ContinueButton />
      <MapControls />
    </div>
  );
});

Map.displayName = `${constants.INSTANCE_NAME}.Map`;
