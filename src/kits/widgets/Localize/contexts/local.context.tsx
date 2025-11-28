import React from "react";
import { StoreApi } from "zustand";
import { TLocalStore } from "../types";
import EventEmitter from "eventemitter3";
import { LocalEventName } from "../enums";
import { createLocalStore } from "../stores/local.store";
import { constants } from "../constants";
import { LibraryUtil } from "@/kits/utils";

const LocalContext = React.createContext<
  | {
      store: StoreApi<TLocalStore>;
      eventBus: EventEmitter<LocalEventName>;
    }
  | undefined
>(undefined);

export interface LocalContextProviderProps {
  init: Pick<
    TLocalStore,
    "lng" | "user" | "location" | "shift" | "loading" | "onUpdateGps" | "onContinue"
  >;
  children: React.ReactNode;
}

export const LocalContextProvider = (props: LocalContextProviderProps) => {
  const { init, children } = props;

  const storeRef = React.useRef<StoreApi<TLocalStore>>(createLocalStore(init));
  const eventBusRef = React.useRef(new EventEmitter<LocalEventName>());

  const storeSelectors = LibraryUtil.zustand.createSelectors(storeRef.current);

  // Initialize store
  React.useEffect(() => {
    storeSelectors.setState({
      ...init,
    });
  }, [init]);

  return (
    <LocalContext.Provider value={{ store: storeRef.current, eventBus: eventBusRef.current }}>
      {children}
    </LocalContext.Provider>
  );
};

LocalContext.displayName = `${constants.INSTANCE_NAME}.LocalContext`;

export const useLocalContext = () => {
  const context = React.useContext(LocalContext);
  if (!context) {
    throw new Error("useLocalContext must be used within a LocalContextProvider");
  }
  return { ...context, store: LibraryUtil.zustand.createSelectors(context.store) };
};
