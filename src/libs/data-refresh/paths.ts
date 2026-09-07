const ROOT = "fms_data_configs";

const sanitizePathSegment = (value: string): string => {
  return value.replace(/[/.#$\[\]]/g, "_");
};

export const dataRefreshRequestsPath = (tenantCode: string, projectCode: string): string => {
  return `${ROOT}/tenants/${sanitizePathSegment(tenantCode)}/projects/${sanitizePathSegment(projectCode)}/requests`;
};

export const userDevicesPath = (tenantCode: string, userId: string): string => {
  return `${ROOT}/tenants/${sanitizePathSegment(tenantCode)}/users/${sanitizePathSegment(userId)}/devices`;
};
