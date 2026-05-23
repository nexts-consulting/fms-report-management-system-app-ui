/**
 * Utility functions for authentication and token handling
 */

import type { KeycloakUser } from "@/types/model";

export interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  username: string;
  role: string;
  [key: string]: any;
}

export type UserRoleClaims = {
  realmRoles?: string[];
  clientRoles?: Record<string, string[]>;
};

function extractClientRolesFromPayload(payload: any): Record<string, string[]> {
  const resourceAccess = payload?.resource_access;
  if (!resourceAccess || typeof resourceAccess !== "object") {
    return {};
  }

  return Object.entries(resourceAccess).reduce<Record<string, string[]>>((acc, [clientId, access]) => {
    const roles = (access as { roles?: unknown })?.roles;
    if (Array.isArray(roles)) {
      acc[clientId] = roles.filter((role): role is string => typeof role === "string");
    }
    return acc;
  }, {});
}

/**
 * Decode JWT token payload (without verification)
 */
export function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as T;
  } catch (error) {
    console.error("Error decoding JWT payload:", error);
    return null;
  }
}

function uniqueRoles(roles: string[]): string[] {
  return Array.from(new Set(roles.filter(Boolean)));
}

export function getRealmRoles(claims?: UserRoleClaims | null): string[] {
  if (!claims || !Array.isArray(claims.realmRoles)) {
    return [];
  }
  return uniqueRoles(claims.realmRoles.filter((role): role is string => typeof role === "string"));
}

export function getClientRoles(claims: UserRoleClaims | null | undefined, clientId?: string): string[] {
  if (!claims?.clientRoles || typeof claims.clientRoles !== "object") {
    return [];
  }

  if (clientId) {
    const clientScopedRoles = claims.clientRoles[clientId];
    if (!Array.isArray(clientScopedRoles)) {
      return [];
    }
    return uniqueRoles(clientScopedRoles.filter((role): role is string => typeof role === "string"));
  }

  return uniqueRoles(
    Object.values(claims.clientRoles)
      .flatMap((roles) => (Array.isArray(roles) ? roles : []))
      .filter((role): role is string => typeof role === "string"),
  );
}

export function getAllRoles(
  claims: UserRoleClaims | null | undefined,
  options?: { clientId?: string; includeRealmRoles?: boolean },
): string[] {
  const includeRealmRoles = options?.includeRealmRoles ?? true;
  const clientRoles = getClientRoles(claims, options?.clientId);
  const realmRoles = includeRealmRoles ? getRealmRoles(claims) : [];
  return uniqueRoles([...realmRoles, ...clientRoles]);
}

export function hasClientRole(
  claims: UserRoleClaims | null | undefined,
  clientId: string,
  role: string,
): boolean {
  if (!role) {
    return false;
  }
  return getClientRoles(claims, clientId).includes(role);
}

export function hasAnyClientRole(
  claims: UserRoleClaims | null | undefined,
  clientId: string,
  roles: string[],
): boolean {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  const userRoles = new Set(getClientRoles(claims, clientId));
  return roles.some((role) => userRoles.has(role));
}

export function hasAllClientRoles(
  claims: UserRoleClaims | null | undefined,
  clientId: string,
  roles: string[],
): boolean {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  const userRoles = new Set(getClientRoles(claims, clientId));
  return roles.every((role) => userRoles.has(role));
}

/**
 * Resolve display full name from auth user (Keycloak).
 */
export function getUserFullName(user: Pick<KeycloakUser, "fullName" | "firstName" | "lastName" | "username">): string {
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return user.fullName?.trim() || fromParts || user.username;
}

/**
 * Extract user info from Keycloak access token
 */
export function getUserFromAccessToken(accessToken: string): {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  realmRoles?: string[];
  clientRoles?: Record<string, string[]>;
  roles?: string[];
  realm?: string;
  clientId?: string;
  [key: string]: any;
} | null {
  try {
    const payload = decodeJwtPayload<any>(accessToken);
    if (!payload) {
      return null;
    }

    const realmRoles = Array.isArray(payload.realm_access?.roles) ? payload.realm_access.roles : [];
    const clientRoles = extractClientRolesFromPayload(payload);

    // Keycloak access token structure
    return {
      id: payload.sub || payload.user_id || "",
      username: payload.preferred_username || payload.username || payload.sub || "",
      email: payload.email,
      firstName: payload.given_name || payload.first_name,
      lastName: payload.family_name || payload.last_name,
      fullName: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
      realmRoles,
      clientRoles,
      // Backward compatibility for old call sites that still use `roles`.
      roles: realmRoles,
      realm: payload.iss?.split("/realms/")[1]?.split("/")[0],
      clientId: Array.isArray(payload.aud) ? payload.aud[0] : payload.aud,
      ...payload, // Include all other claims
    };
  } catch (error) {
    console.error("Error extracting user from access token:", error);
    return null;
  }
}

