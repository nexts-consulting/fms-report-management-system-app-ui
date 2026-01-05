import React from "react";
import { constants } from "../../constants";
import { useLocalContext } from "../../contexts/local.context";
import { LocalEventName } from "../../enums";
import { IconButton } from "@/kits/components/icon-button";
import { Icons } from "@/kits/components/icons";
export interface MapControlsProps {}

export const MapControls = React.memo((props: MapControlsProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localEventBus = localContext.eventBus;

  const handleZoomIn = React.useCallback(() => {
    localEventBus.emit(LocalEventName.MAP_ZOOM_IN);
  }, [localEventBus]);

  const handleZoomOut = React.useCallback(() => {
    localEventBus.emit(LocalEventName.MAP_ZOOM_OUT);
  }, [localEventBus]);

  const handleRecenter = React.useCallback(() => {
    localEventBus.emit(LocalEventName.MAP_RECENTER);
  }, [localEventBus]);

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      <div className="space-y-4">
        <div className="flex flex-col divide-y divide-gray-30">
          <IconButton icon={Icons.Add} variant="white" onClick={handleZoomIn} />
          <IconButton icon={Icons.Subtract} variant="white" onClick={handleZoomOut} />
        </div>
        <IconButton icon={Icons.CenterSquare} variant="white" onClick={handleRecenter} />
      </div>
    </div>
  );
});

MapControls.displayName = `${constants.INSTANCE_NAME}.Map.Controls`;
