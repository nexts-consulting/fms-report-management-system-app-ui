import React from "react";
import { Circle, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PointExpression, LatLngTuple } from "leaflet";
import { useMapResize } from "@/kits/hooks/leaflet/use-map-resize";
import L from "leaflet";
import { JSXMarker } from "@/kits/components/leaflet/JSXMarker";
import { Icons } from "@/kits/components/icons";
import { IconButton } from "@/kits/components/icon-button";
import { RippleDotB } from "@/kits/components/ripple-dot-b";
import { StringUtil } from "@/kits/utils";

const constants = {
  INSTANCE_NAME: "OutletMap",
  mapConfig: {
    MAP_URL:
      "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?lang=en&access_token=pk.eyJ1IjoiZ2FlbGR1b25nIiwiYSI6ImNrb2I1eDZ5NzIyMmEyb3MyZDlqeGRnZTAifQ.p_IcJvFNMnFDoym2YaxlGA",
    DEFAULT_CENTER: [40.704730978394785, -74.00149462878609],
    DEFAULT_ZOOM: 12,
    ZOOM_SNAP: 0.1,
    FITBOUND_PADDING: [50, 50] as PointExpression,
  },
  outletMarkerConfig: {
    MARKER_SIZE: 32,
  },
};

export interface OutletMapProps {
  gps: { lat: number; lng: number };
  radius: number;
}

export const OutletMap = React.memo((props: OutletMapProps) => {
  const { gps, radius } = props;

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, "container"),
  });

  const mapRef = React.useRef<L.Map>(null);

  const handleMapReady = () => {};

  const recenterMap = () => {
    if (!mapRef.current) return;

    const circle = L.circle([gps.lat, gps.lng], {
      radius: radius,
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

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut();
  };

  const handleRecenter = () => {
    handleMapResize();
  };

  React.useEffect(() => {
    recenterMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gps, radius]);

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
        <OutletMarker gps={gps} radius={radius} />
      </MapContainer>

      <MapControl onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onRecenter={handleRecenter} />
    </div>
  );
});

OutletMap.displayName = `${constants.INSTANCE_NAME}`;

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
  radius: number;
}

const OutletMarker = React.memo((props: OutletMarkerProps) => {
  const { gps, radius } = props;

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
      <div className="flex h-full w-full items-center justify-center">
        <RippleDotB size="medium" color="#4589ff" />
      </div>
      <Circle
        center={{ lat: gps.lat, lng: gps.lng }}
        fillColor={"#4589ff"}
        fillOpacity={0.1}
        color={"#4589ff"}
        weight={2}
        radius={radius}
      />
    </JSXMarker>
  );
});

OutletMarker.displayName = `${constants.INSTANCE_NAME}.OutletMarker`;

interface MapControlProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

const MapControl = React.memo((props: MapControlProps) => {
  const { onZoomIn, onZoomOut, onRecenter } = props;

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      <div className="space-y-4">
        <div className="divide-y divide-gray-30">
          <IconButton icon={Icons.Add} variant={"white"} onClick={onZoomIn} />
          <IconButton icon={Icons.Subtract} variant={"white"} onClick={onZoomOut} />
        </div>
        <IconButton icon={Icons.CenterSquare} variant={"white"} onClick={onRecenter} />
      </div>
    </div>
  );
});

MapControl.displayName = `${constants.INSTANCE_NAME}.MapControl`;
