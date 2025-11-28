import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PointExpression, LatLngTuple } from "leaflet";
import { useMapResize } from "@/kits/hooks/leaflet/use-map-resize";
import L from "leaflet";
import { JSXMarker } from "@/kits/components/leaflet/JSXMarker";
import { StringUtil } from "@/kits/utils";
import { Icons } from "@/kits/components/Icons";
import { RippleDotA } from "@/kits/components/RippleDotA";

const constants = {
  INSTANCE_NAME: "CheckinMap",
  mapConfig: {
    MAP_URL:
      "https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?lang=en&access_token=pk.eyJ1IjoiZ2FlbGR1b25nIiwiYSI6ImNrb2I1eDZ5NzIyMmEyb3MyZDlqeGRnZTAifQ.p_IcJvFNMnFDoym2YaxlGA",
    DEFAULT_CENTER: [40.704730978394785, -74.00149462878609],
    DEFAULT_ZOOM: 12,
    ZOOM_SNAP: 0.1,
    FITBOUND_PADDING: [50, 50] as PointExpression,
  },
  outletMarkerConfig: {
    MARKER_SIZE: 56,
  },
};

export interface CheckinMapProps {
  gps: { lat: number; lng: number };
}

export const CheckinMap = React.memo((props: CheckinMapProps) => {
  const { gps } = props;

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, "container"),
  });

  const mapRef = React.useRef<L.Map>(null);

  const handleMapReady = () => {};

  const recenterMap = () => {
    if (!mapRef.current) return;

    const circle = L.circle([gps.lat, gps.lng], {
      radius: 50,
    }).addTo(mapRef.current);
    const bounds = circle.getBounds();
    mapRef.current.removeLayer(circle);

    mapRef.current.fitBounds(bounds, {
      padding: constants.mapConfig.FITBOUND_PADDING,
    });
  };

  const handleMapResize = () => {
    recenterMap();
  };

  React.useEffect(() => {
    recenterMap();
  }, [gps]);

  return (
    <div id={ids.current.container} className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={constants.mapConfig.DEFAULT_CENTER as LatLngTuple}
        zoom={constants.mapConfig.DEFAULT_ZOOM}
        zoomSnap={constants.mapConfig.ZOOM_SNAP}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        attributionControl={false}
        zoomControl={false}
        whenReady={handleMapReady}
      >
        <TileLayer url={constants.mapConfig.MAP_URL} />
        <MapResizer onResize={handleMapResize} />
        <OutletMarker gps={gps} />
      </MapContainer>
    </div>
  );
});

CheckinMap.displayName = `${constants.INSTANCE_NAME}`;

interface MapResizerProps {
  onResize: () => void;
}

export const MapResizer = React.memo((props: MapResizerProps) => {
  const { onResize } = props;

  useMapResize(() => {
    onResize();
  }, []);

  return <></>;
});

MapResizer.displayName = `${constants.INSTANCE_NAME}.MapResizer`;

interface OutletMarkerProps {
  gps: { lat: number; lng: number };
}

const OutletMarker = React.memo((props: OutletMarkerProps) => {
  const { gps } = props;

  const wrapperMarkerRef = React.useRef<L.Marker>(null);

  React.useEffect(() => {
    if (wrapperMarkerRef.current) {
      wrapperMarkerRef.current.setLatLng([gps.lat, gps.lng]);
    }
  }, [gps]);

  return (
    <JSXMarker
      ref={wrapperMarkerRef}
      position={gps}
      iconOptions={{
        className: "",
        iconSize: [
          constants.outletMarkerConfig.MARKER_SIZE,
          constants.outletMarkerConfig.MARKER_SIZE,
        ],
        iconAnchor: [
          constants.outletMarkerConfig.MARKER_SIZE / 2,
          constants.outletMarkerConfig.MARKER_SIZE / 2,
        ],
      }}
    >
      <div className="flex h-full w-full select-none items-center justify-center">
        <div className="relative z-[2] flex min-h-[56px] min-w-[56px] flex-1 -translate-y-2/3 items-stretch justify-center rounded-full bg-white p-1 shadow-lg">
          <div className="relative z-[2] flex h-auto w-full items-center justify-center rounded-full bg-green-40">
            <Icons.Login className="h-5 w-5 text-white" />
          </div>
          <span className="absolute bottom-0 left-[50%] z-[1] h-[14px] w-[14px] translate-x-[-50%] translate-y-[30%] rotate-45 bg-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-[1] flex h-full w-full translate-y-3 items-center justify-center">
          <RippleDotA speed={2} />
        </div>
      </div>
    </JSXMarker>
  );
});

OutletMarker.displayName = `${constants.INSTANCE_NAME}.OutletMarker`;
