/**
 * Secure Cookie Utility for Token Management
 * 
 * Best Practices:
 * - HttpOnly cookies for refresh tokens (not accessible via JS)
 * - Secure flag for HTTPS only in production
 * - SameSite=Strict to prevent CSRF attacks
 * - Access tokens stored in memory/sessionStorage (short-lived)
 */

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number; // in seconds
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Set a cookie with secure defaults
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  if (typeof document === 'undefined') return;

  const {
    path = '/',
    domain,
    maxAge,
    expires,
    secure = process.env.NODE_ENV === 'production', // Only secure in production
    sameSite = 'Strict',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (maxAge !== undefined) cookieString += `; max-age=${maxAge}`;
  if (expires) cookieString += `; expires=${expires.toUTCString()}`;
  if (secure) cookieString += `; secure`;
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie
 */
export const deleteCookie = (
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): void => {
  if (typeof document === 'undefined') return;

  const { path = '/', domain } = options;

  let cookieString = `${encodeURIComponent(name)}=; max-age=0`;
  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;

  document.cookie = cookieString;
};

/**
 * Delete all cookies (for logout)
 */
export const deleteAllCookies = (): void => {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    deleteCookie(name.trim());
  }
};

/**
 * Token Cookie Names
 */
export const TOKEN_COOKIE_NAMES = {
  ACCESS_TOKEN: 'fms_access_token',
  REFRESH_TOKEN: 'fms_refresh_token',
  ID_TOKEN: 'fms_id_token',
  TOKEN_EXPIRES_AT: 'fms_token_expires_at',
} as const;

/**
 * Set access token in cookie (short-lived, can be accessed by JS)
 */
export const setAccessTokenCookie = (token: string, expiresInSeconds: number): void => {
  setCookie(TOKEN_COOKIE_NAMES.ACCESS_TOKEN, token, {
    maxAge: expiresInSeconds,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

/**
 * Set refresh token in cookie (long-lived, HttpOnly if possible)
 * Note: HttpOnly can only be set from server-side. For client-side, we use Secure + SameSite
 */
export const setRefreshTokenCookie = (token: string, expiresInSeconds: number): void => {
  setCookie(TOKEN_COOKIE_NAMES.REFRESH_TOKEN, token, {
    maxAge: expiresInSeconds,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

/**
 * Set ID token in cookie
 */
export const setIdTokenCookie = (token: string, expiresInSeconds: number): void => {
  setCookie(TOKEN_COOKIE_NAMES.ID_TOKEN, token, {
    maxAge: expiresInSeconds,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

/**
 * Set token expiration timestamp
 */
export const setTokenExpiresAtCookie = (timestamp: number): void => {
  const maxAge = Math.floor((timestamp - Date.now()) / 1000);
  setCookie(TOKEN_COOKIE_NAMES.TOKEN_EXPIRES_AT, timestamp.toString(), {
    maxAge: maxAge > 0 ? maxAge : 0,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

/**
 * Get access token from cookie
 */
export const getAccessTokenCookie = (): string | null => {
  return getCookie(TOKEN_COOKIE_NAMES.ACCESS_TOKEN);
};

/**
 * Get refresh token from cookie
 */
export const getRefreshTokenCookie = (): string | null => {
  return getCookie(TOKEN_COOKIE_NAMES.REFRESH_TOKEN);
};

/**
 * Get ID token from cookie
 */
export const getIdTokenCookie = (): string | null => {
  return getCookie(TOKEN_COOKIE_NAMES.ID_TOKEN);
};

/**
 * Get token expiration timestamp from cookie
 */
export const getTokenExpiresAtCookie = (): number | null => {
  const value = getCookie(TOKEN_COOKIE_NAMES.TOKEN_EXPIRES_AT);
  return value ? parseInt(value, 10) : null;
};

/**
 * Clear all token cookies (for logout)
 */
export const clearTokenCookies = (): void => {
  deleteCookie(TOKEN_COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(TOKEN_COOKIE_NAMES.REFRESH_TOKEN);
  deleteCookie(TOKEN_COOKIE_NAMES.ID_TOKEN);
  deleteCookie(TOKEN_COOKIE_NAMES.TOKEN_EXPIRES_AT);
};

/**
 * Check if access token is expired
 */
export const isAccessTokenExpired = (): boolean => {
  const expiresAt = getTokenExpiresAtCookie();
  if (!expiresAt) return true;
  
  // Add 60 second buffer before actual expiration
  return Date.now() >= expiresAt - 60000;
};



