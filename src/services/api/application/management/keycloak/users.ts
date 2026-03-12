import Axios from "axios";
import type {
  KeycloakUser,
  GetKeycloakUsersParams,
  KeycloakGroup,
} from "@/types/model";
import { getAccessTokenCookie } from "@/utils/cookie";

/**
 * Get Keycloak Admin API base URL
 */
const getKeycloakAdminApiUrl = (keycloakBaseUrl: string, realm: string): string => {
  return `${keycloakBaseUrl}/admin/realms/${realm}`;
};

/**
 * Get access token from secure cookie storage
 */
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return getAccessTokenCookie();
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

const normalizeKeycloakAttributeValue = (
  value: string | boolean | number | string[],
): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return [String(value)];
};

const PROFILE_UPDATED_ATTRIBUTE_KEY = "profile_updated";

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

/**
 * Update Keycloak user attributes while preserving existing attributes
 */
export const httpRequestUpdateKeycloakUserAttributes = async (
  userId: string,
  attributes: Record<string, string | boolean | number | string[]>,
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
    const currentUser = await httpRequestGetKeycloakUser(userId);
    const currentAttributes = currentUser.attributes || {};

    const normalizedUpdates = Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [
        key,
        normalizeKeycloakAttributeValue(value),
      ]),
    ) as Record<string, string[]>;

    await Axios.put(
      `${adminApiUrl}/users/${userId}`,
      {
        attributes: {
          ...currentAttributes,
          ...normalizedUpdates,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Error updating Keycloak user attributes:", error);
    throw error;
  }
};

/**
 * Mark whether user has updated profile (single flag for admin filtering)
 */
export const httpRequestMarkKeycloakProfileUpdated = async (
  userId: string,
  isUpdated: boolean = true,
): Promise<void> => {
  return httpRequestUpdateKeycloakUserAttributes(userId, {
    [PROFILE_UPDATED_ATTRIBUTE_KEY]: isUpdated,
  });
};
