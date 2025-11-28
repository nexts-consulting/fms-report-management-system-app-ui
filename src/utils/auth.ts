/**
 * Utility functions for authentication and token handling
 */

export interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  username: string;
  role: string;
  [key: string]: any;
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

    // Keycloak access token structure
    return {
      id: payload.sub || payload.user_id || "",
      username: payload.preferred_username || payload.username || payload.sub || "",
      email: payload.email,
      firstName: payload.given_name || payload.first_name,
      lastName: payload.family_name || payload.last_name,
      fullName: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
      roles: payload.realm_access?.roles || payload.resource_access?.[payload.aud]?.roles || [],
      realm: payload.iss?.split("/realms/")[1]?.split("/")[0],
      clientId: Array.isArray(payload.aud) ? payload.aud[0] : payload.aud,
      ...payload, // Include all other claims
    };
  } catch (error) {
    console.error("Error extracting user from access token:", error);
    return null;
  }
}

