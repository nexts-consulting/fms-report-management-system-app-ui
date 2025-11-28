import React from "react";
import { constants } from "../../constants";
import { useLocalContext } from "../../contexts/local.context";

export interface LocationSummaryProps {}

export const LocationSummary = React.memo((props: LocationSummaryProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const location = localStore.use.location();

  if (!location) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      <div className="bg-gray-10 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium">{location.name}</p>
        </div>
      </div>

      <div className="bg-gray-10 p-4">
        <p className="mb-[2px] line-clamp-1 text-sm font-medium">{location.province}</p>
        <p className="line-clamp-1 text-xs text-gray-50">{location.address}</p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-30">
        {[location.gps.lat.toFixed(5), location.gps.lng.toFixed(5), `${location.radius} m`].map(
          (item) => (
            <div key={item} className="flex-1 items-center justify-center bg-gray-10 p-4">
              <p className="line-clamp-1 text-center text-xs text-gray-70">{item}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
});

LocationSummary.displayName = `${constants.INSTANCE_NAME}.Summary.LocationSummary`;
