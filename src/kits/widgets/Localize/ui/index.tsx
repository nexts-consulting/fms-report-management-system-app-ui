import React from "react";
import { constants } from "../constants";
import { LocalContextProvider } from "../contexts/local.context";
import { TLocalStore } from "../types";
import { Entry } from "./entry";

export interface RootProps {
  lng?: TLocalStore["lng"];
  user: TLocalStore["user"];
  location: TLocalStore["location"];
  shift: TLocalStore["shift"];
  loading?: TLocalStore["loading"];
  onUpdateGps?: TLocalStore["onUpdateGps"];
  onContinue?: TLocalStore["onContinue"];
}

export const Root = React.memo((props: RootProps) => {
  const {
    lng = constants.DEFAULT_LANGUAGE,
    user,
    location,
    shift,
    loading = false,
    onUpdateGps = () => {},
    onContinue = () => {},
  } = props;

  return (
    <LocalContextProvider init={{ lng, user, location, shift, loading, onUpdateGps, onContinue }}>
      <Entry />
    </LocalContextProvider>
  );
});

Root.displayName = `Widget.${constants.INSTANCE_NAME}`;
