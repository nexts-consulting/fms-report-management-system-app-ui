"use client";
import { LibraryUtil } from "@/kits/utils";
import { AuthStore, createAuthStore } from "@/stores/auth.store";
import React, { createContext } from "react";
import { StoreApi } from "zustand";
import { decodeJwtPayload } from "@/utils/auth";
import moment from "moment";
import { useNotification } from "@/kits/components/notification";
import { httpRequestAuthRefresh } from "@/services/api/application/auth/refresh";
import { useGlobalContext } from "./global.context";
import { httpRequestGetUserProfileByKeycloakId } from "@/services/api/application/master-data/user-profiles";
import { IUserProfile } from "@/types/model";

const LOCAL_STORAGE_PROFILE_KEY = "user-profile";

export interface IAuthContext extends StoreApi<AuthStore> {}
export const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = (props: AuthContextProviderProps) => {
  const { children } = props;
  const notification = useNotification();
  const globalStore = useGlobalContext();
  const projectAuthConfig = globalStore.use.projectAuthConfig();

  const storeRef = React.useRef<IAuthContext>();
  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }

  const storeSelectors = LibraryUtil.zustand.createSelectors(storeRef.current);
  const accessToken = storeSelectors.use.accessToken();
  const tokenExpiresAt = storeSelectors.use.tokenExpiresAt();
  const refreshToken = storeSelectors.use.refreshToken();
  const tenant = storeSelectors.use.tenant();
  const project = storeSelectors.use.project();
  const user = storeSelectors.use.user();

  const isRefreshingRef = React.useRef(false);
  const profileFetchOwnerRef = React.useRef<string | null>(null);

  const handleRefreshToken = async (): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      console.log("Refresh already in progress, skipping...");
      return false;
    }

    isRefreshingRef.current = true;
    try {
      if (!refreshToken || !tenant || !projectAuthConfig) {
        console.error("No refresh token, tenant, or project auth config available");
        return false;
      }

      const refreshResponse = await httpRequestAuthRefresh({
        refreshToken,
        tenantCode: tenant.code,
        keycloakBaseUrl: tenant.keycloak_base_url,
        keycloakRealm: tenant.keycloak_realm,
        keycloakClientId: projectAuthConfig.keycloak_client_id,
        keycloakClientSecret: projectAuthConfig.keycloak_client_secret,
      });

      const expiresAt = Date.now() + refreshResponse.expiresIn * 1000;

      storeSelectors.setState({
        accessToken: refreshResponse.accessToken,
        refreshToken: refreshResponse.refreshToken,
        idToken: refreshResponse.idToken,
        tokenExpiresAt: expiresAt,
        token: refreshResponse.accessToken, // Keep for backward compatibility
      });

      isRefreshingRef.current = false;
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      isRefreshingRef.current = false;
      return false;
    }
  };

  const handleValidateToken = async (token: string, expiresAt: number | null | undefined) => {
    try {
      // Check if token is expired based on expiresAt timestamp
      if (expiresAt && Date.now() >= expiresAt) {
        console.warn(`Token expired at: ${new Date(expiresAt).toISOString()}, attempting refresh...`);
        
        // Try to refresh token before reloading
        const refreshed = await handleRefreshToken();
        
        if (!refreshed) {
          notification.error({
            title: "Token expired",
            description: "Unable to refresh token. Please login again.",
          });
          storeSelectors.setState({
            user: null,
            userProfile: null,
            token: null,
            accessToken: null,
            idToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            authenticated: false,
          });
          window.location.reload();
        }
        return;
      }

      // Also validate JWT expiration as fallback
      const decodedToken = decodeJwtPayload<any>(token);
      if (!decodedToken) {
        throw new Error("Invalid token format");
      }
      const isExpired = moment.unix(+decodedToken.exp).isBefore(moment.utc());

      if (isExpired) {
        console.warn(`Token expired: ${moment.unix(+decodedToken.exp).toDate()}, attempting refresh...`);
        
        // Try to refresh token before reloading
        const refreshed = await handleRefreshToken();
        
        if (!refreshed) {
          notification.error({
            title: "Token expired",
            description: "Unable to refresh token. Please login again.",
          });
          storeSelectors.setState({
            user: null,
            userProfile: null,
            token: null,
            accessToken: null,
            idToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            authenticated: false,
          });
          window.location.reload();
        }
      } else {
        // Check if token is about to expire (within 1 minute) and refresh proactively
        const expiresIn = moment.unix(+decodedToken.exp).diff(moment.utc(), "seconds");
        if (expiresIn > 0 && expiresIn < 60) {
          // Token expires in less than 1 minute, refresh proactively
          await handleRefreshToken();
        }
      }
    } catch (err) {
      console.error("Token validation error:", err);
      notification.error({
        title: "Token validation error",
      });
      storeSelectors.setState({
        user: null,
        userProfile: null,
        token: null,
        accessToken: null,
        idToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        authenticated: false,
      });
      window.location.reload();
    }
  };

  React.useEffect(() => {
    let timeoutRef: NodeJS.Timeout;
    let intervalRef: NodeJS.Timeout;

    if (accessToken && tenant && projectAuthConfig) {
      // Validate token immediately
      handleValidateToken(accessToken, tokenExpiresAt);

      // Set up periodic validation (every 30 seconds)
      intervalRef = setInterval(() => {
        handleValidateToken(accessToken, tokenExpiresAt);
      }, 30000);
    } else if (!accessToken) {
      timeoutRef = setTimeout(() => {
        storeSelectors.setState({
          user: null,
          userProfile: null,
          token: null,
          accessToken: null,
          idToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          authenticated: false,
        });
      }, 1000);
    }

    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [accessToken, tokenExpiresAt, refreshToken, tenant, projectAuthConfig]);

  React.useEffect(() => {
    const syncUserProfile = async () => {
      const userId = user?.id;

      if (!userId) {
        profileFetchOwnerRef.current = null;
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        storeSelectors.setState({ userProfile: null });
        return;
      }

      if (profileFetchOwnerRef.current === userId) {
        return;
      }
      profileFetchOwnerRef.current = userId;

      const cachedProfileRaw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (cachedProfileRaw) {
        try {
          const cachedProfile = JSON.parse(cachedProfileRaw) as IUserProfile;
          if (cachedProfile?.keycloak_user_id === userId) {
            storeSelectors.setState({ userProfile: cachedProfile });
          } else {
            localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
            storeSelectors.setState({ userProfile: null });
          }
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
          storeSelectors.setState({ userProfile: null });
        }
      } else {
        storeSelectors.setState({ userProfile: null });
      }

      try {
        const profile = await httpRequestGetUserProfileByKeycloakId(userId);
        if (profile) {
          storeSelectors.setState({ userProfile: profile });
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
        } else {
          storeSelectors.setState({ userProfile: null });
          localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        }
      } catch (error) {
        // Keep app usable even when profile API fails.
        console.error("Failed to sync user profile after login:", error);
      }
    };

    syncUserProfile();
  }, [user?.id]);

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext must be used within a AuthContextProvider");
  }

  return LibraryUtil.zustand.createSelectors(context);
};
