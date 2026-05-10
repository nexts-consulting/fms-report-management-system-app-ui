"use client";

import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { useQueryAppMenus } from "@/services/api/application/app-menu";
import { IAppMenu } from "@/types/model";
import { getClientRoles } from "@/utils/auth";

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
  const tenant = authStore.use.tenant();
  const project = authStore.use.project();
  const user = authStore.use.user();

  const projectCode = project?.code || "";
  const tenantClientKey = tenant?.code;

  const { data: menuItems, isLoading, error } = useQueryAppMenus({
    params: {
      projectCode,
    },
    config: {
      enabled: !!projectCode,
    },
  });

  const visibleMenuItems = React.useMemo(() => {
    const list = menuItems || [];
    const userRoles = new Set(
      tenantClientKey
        ? getClientRoles({ clientRoles: user?.clientRoles }, tenantClientKey)
        : [],
    );
    return list.filter((item) => {
      const required = item.metadata?.roles;
      if (!Array.isArray(required) || required.length === 0) {
        return true;
      }
      return required.some(
        (role) => typeof role === "string" && userRoles.has(role),
      );
    });
  }, [menuItems, user?.clientRoles, tenantClientKey]);

  const value: AppMenuContextValue = React.useMemo(
    () => ({
      menuItems: visibleMenuItems,
      isLoading,
      error: error as Error | null,
    }),
    [visibleMenuItems, isLoading, error],
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

