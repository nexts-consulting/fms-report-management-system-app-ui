import Axios from "axios";
import type {
  KeycloakUser,
  GetKeycloakUsersParams,
  KeycloakGroup,
} from "@/types/model";

/**
 * Get Keycloak Admin API base URL
 */
const getKeycloakAdminApiUrl = (keycloakBaseUrl: string, realm: string): string => {
  return `${keycloakBaseUrl}/admin/realms/${realm}`;
};

/**
 * Get access token from localStorage
 */
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) return null;
  const authData = JSON.parse(authStorage);
  return authData.state?.accessToken || null;
};

/**
 * Get tenant info from localStorage
 */
const getTenantInfo = (): { keycloak_base_url: string; keycloak_realm: string } | null => {
  if (typeof window === "undefined") return null;
  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) return null;
  const authData = JSON.parse(authStorage);
  const tenant = authData.state?.tenant;
  if (!tenant?.keycloak_base_url || !tenant?.keycloak_realm) return null;
  return {
    keycloak_base_url: tenant.keycloak_base_url,
    keycloak_realm: tenant.keycloak_realm,
  };
};

/**
 * Get list of users from Keycloak
 */
export const httpRequestGetKeycloakUsers = async (
  params?: GetKeycloakUsersParams,
): Promise<KeycloakUser[]> => {
  const tenantInfo = getTenantInfo();
  const accessToken = getAccessToken();

  if (!tenantInfo || !accessToken) {
    throw new Error("Tenant information or access token not available");
  }

  const adminApiUrl = getKeycloakAdminApiUrl(
    tenantInfo.keycloak_base_url,
    tenantInfo.keycloak_realm,
  );

  try {
    const response = await Axios.get<KeycloakUser[]>(`${adminApiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching Keycloak users:", error);
    throw error;
  }
};

/**
 * Get a single user by ID
 */
export const httpRequestGetKeycloakUser = async (userId: string): Promise<KeycloakUser> => {
  const tenantInfo = getTenantInfo();
  const accessToken = getAccessToken();

  if (!tenantInfo || !accessToken) {
    throw new Error("Tenant information or access token not available");
  }

  const adminApiUrl = getKeycloakAdminApiUrl(
    tenantInfo.keycloak_base_url,
    tenantInfo.keycloak_realm,
  );

  try {
    const response = await Axios.get<KeycloakUser>(`${adminApiUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching Keycloak user:", error);
    throw error;
  }
};

/**
 * Set user password
 */
export const httpRequestSetUserPassword = async (
  userId: string,
  password: string,
  temporary: boolean = false,
): Promise<void> => {
  const tenantInfo = getTenantInfo();
  const accessToken = getAccessToken();

  if (!tenantInfo || !accessToken) {
    throw new Error("Tenant information or access token not available");
  }

  const adminApiUrl = getKeycloakAdminApiUrl(
    tenantInfo.keycloak_base_url,
    tenantInfo.keycloak_realm,
  );

  try {
    await Axios.put(
      `${adminApiUrl}/users/${userId}/reset-password`,
      {
        type: "password",
        value: password,
        temporary,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Error setting user password:", error);
    throw error;
  }
};

/**
 * Get user groups
 */
export const httpRequestGetUserGroups = async (userId: string): Promise<KeycloakGroup[]> => {
  const tenantInfo = getTenantInfo();
  const accessToken = getAccessToken();

  if (!tenantInfo || !accessToken) {
    throw new Error("Tenant information or access token not available");
  }

  const adminApiUrl = getKeycloakAdminApiUrl(
    tenantInfo.keycloak_base_url,
    tenantInfo.keycloak_realm,
  );

  try {
    const response = await Axios.get<KeycloakGroup[]>(`${adminApiUrl}/users/${userId}/groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching user groups:", error);
    throw error;
  }
};
