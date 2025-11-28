"use client";
import { createGlobalStore, GlobalStore } from "@/stores/global.store";
import React from "react";
import { StoreApi } from "zustand";
import { LibraryUtil } from "../kits/utils/lib.util";

export interface IGlobalContext extends StoreApi<GlobalStore> {}
const GlobalContext = React.createContext<IGlobalContext | undefined>(undefined);

interface GlobalContextProviderProps {
  children: React.ReactNode;
}

export const GlobalContextProvider = (props: GlobalContextProviderProps) => {
  const { children } = props;

  const storeRef = React.useRef<IGlobalContext>();
  if (!storeRef.current) {
    storeRef.current = createGlobalStore();
  }

  return <GlobalContext.Provider value={storeRef.current}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => {
  const context = React.useContext(GlobalContext);

  if (!context) {
    throw new Error("GlobalContext must be used within a GlobalContextProvider");
  }

  return LibraryUtil.zustand.createSelectors(context);
};
