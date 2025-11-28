import { IUserAccount, IStaffProfile } from "@/types/model";
import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { ITenant } from "@/services/application/master-data/tenants";
import { ITenantProject } from "@/services/application/master-data/tenant-projects";

export type AuthStore = {
  token: string | null | undefined;
  authenticated: boolean | undefined;
  user: (IStaffProfile & { account: IUserAccount }) | null | undefined;
  tenant: ITenant | null | undefined;
  project: ITenantProject | null | undefined;
};

export const createAuthStore = () => {
  return createStore<AuthStore>()(
    devtools(
      persist(
        (set, get) => ({
          token: undefined,
          authenticated: undefined,
          user: undefined,
          tenant: undefined,
          project: undefined,
        }),
        {
          name: "auth-storage",
          partialize: (state) => ({
            authenticated: state.authenticated,
            token: state.token,
            user: state.user,
            tenant: state.tenant,
            project: state.project,
          }),
        },
      ),
      { name: "AuthStore" },
    ),
  );
};
