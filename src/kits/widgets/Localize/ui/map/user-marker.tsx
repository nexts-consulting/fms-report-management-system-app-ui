import React from "react";
import { constants, UserMarkerConfig } from "../../constants";
import { useLocalContext } from "../../contexts/local.context";
import { JSXMarker } from "@/kits/components/leaflet/JSXMarker";
import { useMarkerZIndex } from "@/kits/hooks/leaflet/use-marker-zindex";
import { motion } from "framer-motion";

export interface UserMarkerProps {}

export const UserMarker = React.memo((props: UserMarkerProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const user = localStore.use.user();
  const externalLoading = localStore.use.loading();

  const wrapperMarkerRef = React.useRef<L.Marker>(null);
  const markerRef = React.useRef<HTMLDivElement>(null);

  useMarkerZIndex(
    {
      markerRef: markerRef,
      zIndex: UserMarkerConfig.MARKER_ZINDEX_BASE,
    },
    [],
  );

  React.useEffect(() => {
    if (user && user.gps) {
      if (wrapperMarkerRef.current) {
        wrapperMarkerRef.current.setLatLng([user.gps.lat, user.gps.lng]);
      }
    }
  }, [user?.gps]);

  if (!user || !user?.gps || externalLoading) {
    return <></>;
  }

  return (
    <JSXMarker
      ref={wrapperMarkerRef}
      position={user.gps}
      iconOptions={{
        className: "",
        iconSize: [UserMarkerConfig.MARKER_SIZE, UserMarkerConfig.MARKER_SIZE],
        iconAnchor: [UserMarkerConfig.MARKER_SIZE / 2, UserMarkerConfig.MARKER_SIZE],
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        ref={markerRef}
      >
        <div className="flex h-full w-full select-none items-center justify-center">
          <div className="relative flex min-h-[56px] min-w-[56px] flex-1 -translate-y-4 items-center justify-center rounded-full bg-white p-1 shadow-lg">
            <img
              src={user.avatar || "/images/user-avatar.webp"}
              alt="avatar"
              className="z-[2] !h-12 !w-12 flex-1 rounded-full bg-gray-20 object-cover"
            />
            <span className="absolute bottom-0 left-[50%] z-[1] h-[14px] w-[14px] translate-x-[-50%] translate-y-[30%] rotate-45 bg-white" />
          </div>
        </div>
      </motion.div>
    </JSXMarker>
  );
});

UserMarker.displayName = `${constants.INSTANCE_NAME}.Map.UserMarker`;
