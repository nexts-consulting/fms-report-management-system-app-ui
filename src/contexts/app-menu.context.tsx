"use client";

import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useQueryAppMenus } from "@/services/api/application/app-menu";
import { IAppMenu } from "@/types/model";

interface AppMenuContextValue {
  menuItems: IAppMenu[];
  isLoading: boolean;
  error: Error | null;
}

const AppMenuContext = React.createContext<AppMenuContextValue | undefined>(undefined);

interface AppMenuProviderProps {
  children: React.ReactNode;
}

/**
 * Provider to automatically load app menus for the current project
 * Uses React Query for caching and localStorage for persistence
 */
export const AppMenuProvider = (props: AppMenuProviderProps) => {
  const { children } = props;
  const authStore = useAuthContext();
  const project = authStore.use.project();

  const projectCode = project?.code || "";

  const { data: menuItems, isLoading, error } = useQueryAppMenus({
    params: {
      projectCode,
    },
    config: {
      enabled: !!projectCode, // Only fetch when project code is available
    },
  });

  const value: AppMenuContextValue = React.useMemo(
    () => ({
      menuItems: menuItems || [],
      isLoading,
      error: error as Error | null,
    }),
    [menuItems, isLoading, error],
  );

  return <AppMenuContext.Provider value={value}>{children}</AppMenuContext.Provider>;
};

/**
 * Hook to access app menu items from context
 * Must be used within AppMenuProvider
 */
export const useAppMenuContext = () => {
  const context = React.useContext(AppMenuContext);

  if (!context) {
    throw new Error("useAppMenuContext must be used within AppMenuProvider");
  }

  return context;
};

