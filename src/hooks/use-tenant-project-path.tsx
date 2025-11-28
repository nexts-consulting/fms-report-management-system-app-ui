import { useParams, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/auth.context";
import { buildPathWithTenantAndProject } from "@/utils/routing";
import { useMemo } from "react";

/**
 * Hook to get tenant code, project code and build paths with tenant and project prefix
 * @returns Object with tenantCode, projectCode and path building function
 */
export function useTenantProjectPath() {
  const params = useParams();
  const pathname = usePathname();
  const authContext = useAuthContext();

  // Get tenant code from params (URL) or auth store
  const tenantCode = useMemo(() => {
    const paramTenantCode = params?.tenant_code as string | undefined;
    const storeTenant = authContext.getState().tenant;

    return paramTenantCode || storeTenant?.code || null;
  }, [params?.tenant_code, authContext]);

  // Get project code from params (URL) or auth store
  const projectCode = useMemo(() => {
    const paramProjectCode = params?.project_code as string | undefined;
    const storeProject = authContext.getState().project;

    return paramProjectCode || storeProject?.code || null;
  }, [params?.project_code, authContext]);

  /**
   * Build path with tenant code and project code prefix
   * @param path - Path without tenant/project code (e.g., "/lobby")
   * @returns Path with tenant and project code (e.g., "/fms/project1/lobby")
   */
  const buildPath = (path: string): string => {
    return buildPathWithTenantAndProject(path, tenantCode, projectCode);
  };

  return {
    tenantCode,
    projectCode,
    buildPath,
    currentPath: pathname,
  };
}

