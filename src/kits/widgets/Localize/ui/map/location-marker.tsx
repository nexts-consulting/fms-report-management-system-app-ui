import React from "react";
import { constants, LocationMarkerConfig } from "../../constants";
import { useLocalContext } from "../../contexts/local.context";
import { JSXMarker } from "@/kits/components/leaflet/JSXMarker";
import { Circle } from "react-leaflet";
import { useMarkerZIndex } from "@/kits/hooks/leaflet/use-marker-zindex";
import { RippleDotB } from "@/kits/components/RippleDotB";

export interface LocationMarkerProps {}

export const LocationMarker = React.memo((props: LocationMarkerProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const location = localStore.use.location();
  const externalLoading = localStore.use.loading();
  const isUserInLocationScope = localStore.use.isUserInLocationScope();

  const wrapperMarkerRef = React.useRef<L.Marker>(null);
  const markerRef = React.useRef<HTMLDivElement>(null);

  useMarkerZIndex(
    {
      markerRef: markerRef,
      zIndex: LocationMarkerConfig.MARKER_ZINDEX_BASE,
    },
    [],
  );

  React.useEffect(() => {
    if (wrapperMarkerRef.current && location) {
      wrapperMarkerRef.current.setLatLng([location.gps.lat, location.gps.lng]);
    }
  }, [location]);

  if (!location || externalLoading) {
    return <></>;
  }

  return (
    <JSXMarker
      ref={wrapperMarkerRef}
      position={location.gps}
      iconOptions={{
        className: "",
        iconSize: [LocationMarkerConfig.MARKER_SIZE, LocationMarkerConfig.MARKER_SIZE],
        iconAnchor: [LocationMarkerConfig.MARKER_SIZE / 2, LocationMarkerConfig.MARKER_SIZE / 2],
      }}
    >
      <div ref={markerRef} className="relative flex h-full w-full items-center justify-center">
        {isUserInLocationScope && <RippleDotB size="medium" color="#24a148" />}
        {!isUserInLocationScope && <RippleDotB size="medium" color="#fa4d56" />}
      </div>

      {isUserInLocationScope && (
        <Circle
          center={{ lat: location.gps.lat, lng: location.gps.lng }}
          fillColor={"#42be65"}
          fillOpacity={0.1}
          color={"#42be65"}
          weight={2}
          radius={location.radius}
        />
      )}

      {!isUserInLocationScope && (
        <Circle
          center={{ lat: location.gps.lat, lng: location.gps.lng }}
          fillColor={"#ff8389"}
          fillOpacity={0.1}
          color={"#ff8389"}
          weight={2}
          radius={location.radius}
        />
      )}
    </JSXMarker>
  );
});

LocationMarker.displayName = `${constants.INSTANCE_NAME}.Map.LocationMarker`;
