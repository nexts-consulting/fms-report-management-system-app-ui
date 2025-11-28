/**
 * Utility functions for routing with tenant code and project code
 */

/**
 * Build path with tenant code and project code prefix
 * @param path - Path without tenant/project code (e.g., "/lobby", "/attendance/tracking")
 * @param tenantCode - Tenant code from params or auth store
 * @param projectCode - Project code from params or auth store
 * @returns Path with tenant and project code (e.g., "/fms/project1/lobby")
 */
export function buildPathWithTenantAndProject(
  path: string,
  tenantCode: string | null | undefined,
  projectCode: string | null | undefined,
): string {
  if (!tenantCode || !projectCode) {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Remove tenant and project code if already present
  const pathWithoutPrefix = cleanPath.startsWith(`${tenantCode}/${projectCode}/`)
    ? cleanPath.slice(tenantCode.length + projectCode.length + 2)
    : cleanPath.startsWith(`${tenantCode}/`)
    ? cleanPath.slice(tenantCode.length + 1)
    : cleanPath;

  return `/${tenantCode}/${projectCode}/${pathWithoutPrefix}`;
}

/**
 * Get tenant code and project code from current pathname
 * @param pathname - Current pathname (e.g., "/fms/project1/lobby")
 * @returns Object with tenantCode and projectCode or null
 */
export function getTenantAndProjectCodeFromPath(pathname: string): {
  tenantCode: string | null;
  projectCode: string | null;
} {
  const segments = pathname.split("/").filter(Boolean);
  return {
    tenantCode: segments.length > 0 ? segments[0] : null,
    projectCode: segments.length > 1 ? segments[1] : null,
  };
}

/**
 * Remove tenant code and project code from path
 * @param path - Path with tenant and project code (e.g., "/fms/project1/lobby")
 * @returns Path without tenant and project code (e.g., "/lobby")
 */
export function removeTenantAndProjectCodeFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 2) {
    return "/" + segments.slice(2).join("/");
  }
  return "/";
}

