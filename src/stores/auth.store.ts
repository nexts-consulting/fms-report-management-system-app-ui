import { KeycloakUser } from "@/types/model";
import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { ITenant, ITenantProject } from "@/types/model";

export type AuthStore = {
  token: string | null | undefined;
  accessToken: string | null | undefined;
  refreshToken: string | null | undefined;
  idToken: string | null | undefined;
  tokenExpiresAt: number | null | undefined;
  authenticated: boolean | undefined;
  user: KeycloakUser | null | undefined;
  tenant: ITenant | null | undefined;
  project: ITenantProject | null | undefined;
};

export const createAuthStore = () => {
  return createStore<AuthStore>()(
    devtools(
      persist(
        (set, get) => ({
          token: undefined,
          accessToken: undefined,
          refreshToken: undefined,
          idToken: undefined,
          tokenExpiresAt: undefined,
          authenticated: undefined,
          user: undefined,
          tenant: undefined,
          project: undefined,
        }),
        {
          name: "auth-storage",
          partialize: (state) => ({
            authenticated: state.authenticated,
            token: state.token || state.accessToken,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            idToken: state.idToken,
            tokenExpiresAt: state.tokenExpiresAt,
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
