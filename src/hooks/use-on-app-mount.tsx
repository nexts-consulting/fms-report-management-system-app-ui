import React from "react";
import { useCheckCurrentShift } from "./use-check-current-shift";
import { useCheckConnection } from "./use-check-connection";

export const useOnAppMount = () => {
  useCheckCurrentShift();
  useCheckConnection();

  React.useEffect(() => {
    console.log("App mounted");
  }, []);
};
