"use client";
import { LibraryUtil } from "@/kits/utils";
import { AuthStore, createAuthStore } from "@/stores/auth.store";
import React, { createContext } from "react";
import { StoreApi } from "zustand";

export interface IAuthContext extends StoreApi<AuthStore> {}
export const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = (props: AuthContextProviderProps) => {
  const { children } = props;

  const storeRef = React.useRef<IAuthContext>();
  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext must be used within a AuthContextProvider");
  }

  return LibraryUtil.zustand.createSelectors(context);
};
