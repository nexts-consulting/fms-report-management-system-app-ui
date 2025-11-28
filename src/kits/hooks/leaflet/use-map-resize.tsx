import React from "react";
import { useMap } from "react-leaflet";

export const useMapResize = (callback?: () => void, deps?: React.DependencyList) => {
  const map = useMap();

  const handleResize = React.useCallback(() => {
    map.invalidateSize();
    map.flyTo(map.getCenter());
    callback && callback();
  }, [map, callback]);

  React.useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize, ...(deps || [])]);
};
