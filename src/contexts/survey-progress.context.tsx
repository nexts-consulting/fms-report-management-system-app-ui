"use client";

import {
  createSurveyProgressStore,
  SurveyProgressStore,
  SurveyStep,
} from "@/stores/survey-progress.store";
import React from "react";
import { StoreApi } from "zustand";
import { LibraryUtil } from "../kits/utils/lib.util";

export interface ISurveyProgressContext extends StoreApi<SurveyProgressStore> {}
const SurveyProgressContext = React.createContext<ISurveyProgressContext | undefined>(undefined);

interface SurveyProgressContextProviderProps {
  children: React.ReactNode;
  defaultStep: SurveyStep;
  storeName: string;
}

export const SurveyProgressContextProvider = (props: SurveyProgressContextProviderProps) => {
  const { children, defaultStep, storeName } = props;

  const storeRef = React.useRef<ISurveyProgressContext>();
  if (!storeRef.current) {
    storeRef.current = createSurveyProgressStore({
      defaultStep,
      storeName,
    });
  }

  return (
    <SurveyProgressContext.Provider value={storeRef.current}>
      {children}
    </SurveyProgressContext.Provider>
  );
};

export const useSurveyProgressContext = () => {
  const context = React.useContext(SurveyProgressContext);

  if (!context) {
    throw new Error("SurveyProgressContext must be used within a SurveyProgressContextProvider");
  }

  return LibraryUtil.zustand.createSelectors(context);
};
