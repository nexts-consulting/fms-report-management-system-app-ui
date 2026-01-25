import { Icons } from "@/kits/components/icons";
import { OutletMap } from "@/kits/widgets/OutletMap";
import React from "react";

interface LocationInfoSectionProps {
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
  address: string;
}

export const LocationInfoSection = React.memo((props: LocationInfoSectionProps) => {
  const { latitude, longitude, radius, name, address } = props;

  return (
    <div className="mt-4 divide-y divide-gray-30">
      <div className="aspect-[3/2] h-auto w-full bg-white p-4">
        <OutletMap
          gps={{
            lat: latitude,
            lng: longitude,
          }}
          radius={radius}
        />
      </div>
      <div className="flex items-center justify-start gap-4 bg-white p-4">
        <Icons.Location className="shrink-0 text-gray-50" />
        <div>
          <p className="line-clamp-1 text-sm font-medium text-gray-100">{name}</p>
          <p className="line-clamp-1 text-xs text-gray-50">{address}</p>
        </div>
      </div>
    </div>
  );
});

LocationInfoSection.displayName = "LocationInfoSection";



