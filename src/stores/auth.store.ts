import { KeycloakUser } from "@/types/model";
import { createStore } from "zustand";
import { persist, devtools, PersistStorage, StorageValue } from "zustand/middleware";
import { ITenant, ITenantProject } from "@/types/model";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setIdTokenCookie,
  setTokenExpiresAtCookie,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  getIdTokenCookie,
  getTokenExpiresAtCookie,
  clearTokenCookies,
} from "@/utils/cookie";

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

/**
 * Custom storage that uses cookies for tokens instead of localStorage
 * This is more secure as cookies can be HttpOnly and have better security controls
 */
const createSecureStorage = (): PersistStorage<AuthStore> => ({
  getItem: (name: string): StorageValue<AuthStore> | null => {
    if (typeof window === 'undefined') return null;

    try {
      // Get tokens from cookies
      const accessToken = getAccessTokenCookie();
      const refreshToken = getRefreshTokenCookie();
      const idToken = getIdTokenCookie();
      const tokenExpiresAt = getTokenExpiresAtCookie();

      // Get non-sensitive data from localStorage
      const item = localStorage.getItem(name);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Merge tokens from cookies with other data from localStorage
      return {
        ...parsed,
        state: {
          ...parsed.state,
          token: accessToken,
          accessToken,
          refreshToken,
          idToken,
          tokenExpiresAt,
        },
      };
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<AuthStore>): void => {
    if (typeof window === 'undefined') return;

    try {
      const state = value.state;

      // Store tokens in cookies (more secure)
      if (state.accessToken && state.tokenExpiresAt) {
        const expiresInSeconds = Math.floor((state.tokenExpiresAt - Date.now()) / 1000);
        setAccessTokenCookie(state.accessToken, expiresInSeconds);
        setTokenExpiresAtCookie(state.tokenExpiresAt);
      }

      if (state.refreshToken && state.tokenExpiresAt) {
        // Refresh token typically lasts longer, default to 7 days
        const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
        setRefreshTokenCookie(state.refreshToken, expiresInSeconds);
      }

      if (state.idToken && state.tokenExpiresAt) {
        const expiresInSeconds = Math.floor((state.tokenExpiresAt - Date.now()) / 1000);
        setIdTokenCookie(state.idToken, expiresInSeconds);
      }

      // Store non-sensitive data in localStorage (user info, tenant, etc.)
      // Remove tokens from localStorage
      const sanitizedState = { ...state };
      delete sanitizedState.token;
      delete sanitizedState.accessToken;
      delete sanitizedState.refreshToken;
      delete sanitizedState.idToken;
      delete sanitizedState.tokenExpiresAt;

      localStorage.setItem(
        name,
        JSON.stringify({
          ...value,
          state: sanitizedState,
        })
      );
    } catch (error) {
      console.error('Error writing to secure storage:', error);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;

    try {
      // Clear token cookies
      clearTokenCookies();
      // Clear localStorage
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
});

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
          storage: createSecureStorage(),
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
