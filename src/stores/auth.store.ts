import { IUserAccount, IStaffProfile } from "@/types/model";
import { createStore } from "zustand";
import { persist, devtools } from "zustand/middleware";

export type AuthStore = {
  token: string | null | undefined;
  authenticated: boolean | undefined;
  user: (IStaffProfile & { account: IUserAccount }) | null | undefined;
};

export const createAuthStore = () => {
  return createStore<AuthStore>()(
    devtools(
      persist(
        (set, get) => ({
          token: undefined,
          authenticated: undefined,
          user: undefined,
        }),
        {
          name: "auth-storage",
          partialize: (state) => ({
            authenticated: state.authenticated,
            token: state.token,
            user: state.user,
          }),
        },
      ),
      { name: "AuthStore" },
    ),
  );
};
