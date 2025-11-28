import Axios from "axios";

// Keycloak User types
export interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
  groups?: string[];
  realmRoles?: string[];
  clientRoles?: Record<string, string[]>;
}

export interface CreateKeycloakUserInput {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  password?: string;
  temporary?: boolean; // If true, user must change password on first login
  attributes?: Record<string, string[]>;
  groups?: string[];
}

export interface UpdateKeycloakUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  attributes?: Record<string, string[]>;
}

export interface GetKeycloakUsersParams {
  search?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  exact?: boolean;
  first?: number; // pagination offset
  max?: number; // pagination limit
}

export interface KeycloakGroup {
  id: string;
  name: string;
  path: string;
  subGroups?: KeycloakGroup[];
}

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
 * Create a new user in Keycloak
 */
export const httpRequestCreateKeycloakUser = async (
  input: CreateKeycloakUserInput,
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
    await Axios.post(
      `${adminApiUrl}/users`,
      {
        username: input.username,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        enabled: input.enabled !== undefined ? input.enabled : true,
        emailVerified: input.emailVerified !== undefined ? input.emailVerified : false,
        attributes: input.attributes || {},
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    // If password is provided, set it separately
    if (input.password) {
      // First, get the created user by username
      const users = await httpRequestGetKeycloakUsers({ username: input.username, exact: true });
      if (users.length > 0) {
        const userId = users[0].id;
        await httpRequestSetUserPassword(userId, input.password, input.temporary || false);
      }
    }

    // If groups are provided, assign user to groups
    if (input.groups && input.groups.length > 0) {
      const users = await httpRequestGetKeycloakUsers({ username: input.username, exact: true });
      if (users.length > 0) {
        const userId = users[0].id;
        for (const groupId of input.groups) {
          await httpRequestAddUserToGroup(userId, groupId);
        }
      }
    }
  } catch (error: any) {
    console.error("Error creating Keycloak user:", error);
    throw error;
  }
};

/**
 * Update a user in Keycloak
 */
export const httpRequestUpdateKeycloakUser = async (
  userId: string,
  input: UpdateKeycloakUserInput,
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
      `${adminApiUrl}/users/${userId}`,
      {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        enabled: input.enabled,
        emailVerified: input.emailVerified,
        attributes: input.attributes || {},
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Error updating Keycloak user:", error);
    throw error;
  }
};

/**
 * Delete a user from Keycloak
 */
export const httpRequestDeleteKeycloakUser = async (userId: string): Promise<void> => {
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
    await Axios.delete(`${adminApiUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error deleting Keycloak user:", error);
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
 * Add user to group
 */
export const httpRequestAddUserToGroup = async (userId: string, groupId: string): Promise<void> => {
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
      `${adminApiUrl}/users/${userId}/groups/${groupId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Error adding user to group:", error);
    throw error;
  }
};

/**
 * Remove user from group
 */
export const httpRequestRemoveUserFromGroup = async (
  userId: string,
  groupId: string,
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
    await Axios.delete(`${adminApiUrl}/users/${userId}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error removing user from group:", error);
    throw error;
  }
};

