import React from "react";
import { constants } from "../../constants";
import { useLocalContext } from "../../contexts/local.context";
import { LocalEventName } from "../../enums";
import { useMapResize } from "@/kits/hooks/leaflet/use-map-resize";

export interface MapResizerProps {}

export const MapResizer = React.memo((props: MapResizerProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;
  const localEventBus = localContext.eventBus;

  const isExpandedSummary = localStore.use.isExpandedSummary();

  const handleMapResize = React.useCallback(() => {
    localEventBus.emit(LocalEventName.MAP_RECENTER);
  }, [localEventBus]);

  useMapResize(handleMapResize, [isExpandedSummary]);

  return <></>;
});

MapResizer.displayName = `${constants.INSTANCE_NAME}.Map.MapResizer`;
