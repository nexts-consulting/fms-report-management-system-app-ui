import React from "react";
import { Circle, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PointExpression, LatLngTuple } from "leaflet";
import { useMapResize } from "@/kits/hooks/leaflet/use-map-resize";
import L from "leaflet";
import { JSXMarker } from "@/kits/components/leaflet/JSXMarker";
import { StringUtil } from "@/kits/utils";
import { RippleDotA } from "@/kits/components/RippleDotA";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";
import { StyleUtil } from "@/kits/utils";

const constants = {
  INSTANCE_NAME: "StaffCheckinMap",
  mapConfig: {
    MAP_URL:
      "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?lang=en&access_token=pk.eyJ1IjoiZ2FlbGR1b25nIiwiYSI6ImNrb2I1eDZ5NzIyMmEyb3MyZDlqeGRnZTAifQ.p_IcJvFNMnFDoym2YaxlGA",
    DEFAULT_CENTER: [40.704730978394785, -74.00149462878609],
    DEFAULT_ZOOM: 12,
    ZOOM_SNAP: 0.1,
    FITBOUND_PADDING: [50, 50] as PointExpression,
  },
  userMarkerConfig: {
    MARKER_SIZE: 56,
  },
  outletMarkerConfig: {
    MARKER_SIZE: 56,
  },
};

export interface StaffCheckinMapProps {
  user: {
    avatar: string;
    gps: { lat: number; lng: number };
  };
  outlet: {
    gps: { lat: number; lng: number };
    radius: number;
  };
  image: string;
}

export const StaffCheckinMap = React.memo((props: StaffCheckinMapProps) => {
  const { user, outlet, image } = props;

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, "container"),
  });

  const mapRef = React.useRef<L.Map>(null);

  const handleMapReady = () => {};

  const recenterMap = () => {
    if (!mapRef.current) return;

    const circle = L.circle([user.gps.lat, user.gps.lng], {
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
  }, [user?.gps]);

  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div id={ids.current.container} className="relative h-full w-full">
      <div className="relative z-[1] h-full w-full">
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
          <UserMarker user={user} />
          <OutletMarker outlet={outlet} />
        </MapContainer>
      </div>

      {image && (
        <div
          className={StyleUtil.cn(
            "absolute z-[2] p-4",
            isExpanded ? "inset-0 max-w-none" : "bottom-0 left-0 h-[35%] w-[35%]",
          )}
        >
          <div className="relative h-full w-full bg-white p-2">
            <div className="absolute right-2 top-2 z-[1]">
              <IconButton
                icon={isExpanded ? Icons.Minimize : Icons.Maximize}
                variant="gray-10"
                size="medium"
                onClick={() => setIsExpanded(!isExpanded)}
              />
            </div>
            <img src={image} alt="image" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
});

StaffCheckinMap.displayName = `${constants.INSTANCE_NAME}`;

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

interface UserMarkerProps {
  user: {
    avatar: string;
    gps: { lat: number; lng: number };
  };
}

const UserMarker = React.memo((props: UserMarkerProps) => {
  const { user } = props;

  const wrapperMarkerRef = React.useRef<L.Marker>(null);

  React.useEffect(() => {
    if (wrapperMarkerRef.current) {
      wrapperMarkerRef.current.setLatLng([user.gps.lat, user.gps.lng]);
    }
  }, [user?.gps]);

  return (
    <JSXMarker
      ref={wrapperMarkerRef}
      position={user.gps}
      iconOptions={{
        className: "",
        iconSize: [constants.userMarkerConfig.MARKER_SIZE, constants.userMarkerConfig.MARKER_SIZE],
        iconAnchor: [
          constants.userMarkerConfig.MARKER_SIZE / 2,
          constants.userMarkerConfig.MARKER_SIZE / 2,
        ],
      }}
    >
      <div className="flex h-full w-full select-none items-center justify-center">
        <div className="relative z-[2] flex min-h-[56px] min-w-[56px] flex-1 -translate-y-12 items-stretch justify-center rounded-full bg-white p-1 shadow-lg">
          <img
            src={user.avatar || "/images/user-avatar.webp"}
            alt="avatar"
            className="z-[2] !h-12 !w-12 flex-1 rounded-full bg-gray-20 object-cover"
          />
          <span className="absolute bottom-0 left-[50%] z-[1] h-[14px] w-[14px] translate-x-[-50%] translate-y-[30%] rotate-45 bg-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-[1] flex h-full w-full items-center justify-center">
          <RippleDotA speed={2} color="#42be65" />
        </div>
      </div>
    </JSXMarker>
  );
});

UserMarker.displayName = `${constants.INSTANCE_NAME}.UserMarker`;

interface OutletMarkerProps {
  outlet: {
    gps: { lat: number; lng: number };
    radius: number;
  };
}

const OutletMarker = React.memo((props: OutletMarkerProps) => {
  const { outlet } = props;

  const wrapperMarkerRef = React.useRef<L.Marker>(null);

  React.useEffect(() => {
    if (wrapperMarkerRef.current) {
      wrapperMarkerRef.current.setLatLng([outlet.gps.lat, outlet.gps.lng]);
    }
  }, [outlet?.gps]);

  return (
    <JSXMarker
      ref={wrapperMarkerRef}
      position={outlet.gps}
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
      <Circle
        center={{ lat: outlet.gps.lat, lng: outlet.gps.lng }}
        fillColor={"#F68B1E"}
        fillOpacity={0.1}
        color={"#F68B1E"}
        weight={2}
        radius={outlet.radius}
      />
    </JSXMarker>
  );
});

OutletMarker.displayName = `${constants.INSTANCE_NAME}.OutletMarker`;
