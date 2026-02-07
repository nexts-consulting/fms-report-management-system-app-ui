import Axios from "axios";
import type {
  KeycloakGroup,
  GetKeycloakGroupsParams,
  KeycloakUser,
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


/**
 * Recursively fetch subGroups for a group
 */
const fetchSubGroups = async (
  groupId: string,
  adminApiUrl: string,
  accessToken: string,
): Promise<KeycloakGroup[]> => {
  try {
    const response = await Axios.get<KeycloakGroup[]>(`${adminApiUrl}/groups/${groupId}/children`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        briefRepresentation: false,
      },
    });

    const subGroups = response.data || [];
    
    // Recursively fetch subGroups for each child
    const subGroupsWithChildren = await Promise.all(
      subGroups.map(async (subGroup) => {
        const children = await fetchSubGroups(subGroup.id, adminApiUrl, accessToken);
        return {
          ...subGroup,
          subGroups: children.length > 0 ? children : undefined,
        };
      }),
    );

    return subGroupsWithChildren;
  } catch (error: any) {
    // If endpoint doesn't exist or returns 404, return empty array
    if (error?.response?.status === 404) {
      return [];
    }
    console.error(`Error fetching subGroups for group ${groupId}:`, error);
    return [];
  }
};

/**
 * Get all groups from Keycloak with nested subGroups
 * Note: briefRepresentation=false is required to get subGroups
 */
export const httpRequestGetKeycloakGroups = async (
  params?: GetKeycloakGroupsParams,
): Promise<KeycloakGroup[]> => {
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
    const response = await Axios.get<KeycloakGroup[]>(`${adminApiUrl}/groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        ...params,
        briefRepresentation: false, // Required to get subGroups
      },
    });

    const groups = response.data || [];

    // Process groups and ensure subGroups are loaded
    const groupsWithSubGroups = await Promise.all(
      groups.map(async (group) => {
        // If subGroups are already in response, recursively process them
        if (group.subGroups && group.subGroups.length > 0) {
          const processSubGroups = async (subGroups: KeycloakGroup[]): Promise<KeycloakGroup[]> => {
            return Promise.all(
              subGroups.map(async (subGroup) => {
                // Recursively process nested subGroups
                const processedSubGroups = subGroup.subGroups && subGroup.subGroups.length > 0
                  ? await processSubGroups(subGroup.subGroups)
                  : undefined;
                
                // If subGroups exist but are empty or undefined, try to fetch them
                if (!processedSubGroups || processedSubGroups.length === 0) {
                  const fetchedSubGroups = await fetchSubGroups(subGroup.id, adminApiUrl, accessToken);
                  return {
                    ...subGroup,
                    subGroups: fetchedSubGroups.length > 0 ? fetchedSubGroups : undefined,
                  };
                }
                
                return {
                  ...subGroup,
                  subGroups: processedSubGroups,
                };
              }),
            );
          };

          const processedSubGroups = await processSubGroups(group.subGroups);
          return {
            ...group,
            subGroups: processedSubGroups.length > 0 ? processedSubGroups : undefined,
          };
        } else {
          // Try to fetch subGroups if not in response
          const subGroups = await fetchSubGroups(group.id, adminApiUrl, accessToken);
          return {
            ...group,
            subGroups: subGroups.length > 0 ? subGroups : undefined,
          };
        }
      }),
    );

    return groupsWithSubGroups;
  } catch (error: any) {
    console.error("Error fetching Keycloak groups:", error);
    throw error;
  }
};

/**
 * Get a single group by ID
 * Note: briefRepresentation=false is required to get subGroups
 */
export const httpRequestGetKeycloakGroup = async (groupId: string): Promise<KeycloakGroup> => {
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
    const response = await Axios.get<KeycloakGroup>(`${adminApiUrl}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        briefRepresentation: false, // Required to get subGroups
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching Keycloak group:", error);
    throw error;
  }
};

/**
 * Get group members
 */
export const httpRequestGetGroupMembers = async (
  groupId: string,
  params?: { first?: number; max?: number },
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
    const response = await Axios.get<KeycloakUser[]>(
      `${adminApiUrl}/groups/${groupId}/members`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params,
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching group members:", error);
    throw error;
  }
};
