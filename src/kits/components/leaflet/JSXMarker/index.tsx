import { useState, useMemo, forwardRef } from "react";
import { Marker, MarkerProps } from "react-leaflet";
import ReactDOM from "react-dom";
import L from "leaflet";

const constants = {
  INSTANCE_NAME: "JSXMarker",
};

interface Props extends MarkerProps {
  /**
   * Options to pass to the react-lefalet L.divIcon that is used as the marker's custom icon
   */
  iconOptions?: L.DivIconOptions;
}

/**
 * React-leaflet marker that allows for fully interactive JSX in icon
 */
export const JSXMarker = forwardRef<L.Marker, Props>(
  ({ children, iconOptions, ...rest }, refInParent) => {
    const [ref, setRef] = useState<L.Marker | null>(null);

    const node = useMemo(
      () => (ref ? ReactDOM.createPortal(children, ref.getElement()!) : null),
      [ref, children],
    );

    return (
      <>
        {useMemo(
          () => (
            <Marker
              {...rest}
              ref={(r) => {
                setRef(r as L.Marker);
                if (refInParent) {
                  // @ts-expect-error forwardRef ts defs are tricky
                  refInParent.current = r;
                }
              }}
              icon={L.divIcon(iconOptions)}
            />
          ),
          [],
        )}
        {ref && node}
      </>
    );
  },
);

JSXMarker.displayName = constants.INSTANCE_NAME;
