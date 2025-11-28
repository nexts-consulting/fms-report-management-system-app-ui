import { useQuery } from "react-query";
import { axiosApi } from "@/libs/axios";
import { supabaseMasterService } from "@/services/supabase";

export interface ITenant {
  id: string;
  code: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  start_date: string;
  end_date: string;
  keycloak_base_url: string;
  keycloak_realm: string;
  kong_gateway_url: string;
  status: string;
  metadata: any | null;
  created_at: string;
  updated_at: string;
  version: number;
}

const httpRequestGetTenants = async (): Promise<ITenant[]> => {
  try {
    const res = await axiosApi.get("/master-data/rest/v1/tenants");
    return res.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Query tenant by code using Supabase
 * @param tenantCode - Tenant code to query
 * @returns Tenant object or null if not found
 */
const httpRequestGetTenantByCode = async (tenantCode: string): Promise<ITenant | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("tenants")
      .select("*")
      .eq("code", tenantCode)
      .eq("status", "ACTIVE")
      .single();

    if (error) {
      // If no record is found, return null
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as ITenant;
  } catch (error) {
    console.error("Error fetching tenant by code:", error);
    throw error;
  }
};

const useQueryTenants = (config?: any) => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: httpRequestGetTenants,
    ...config,
  });
};

const useQueryTenantByCode = (tenantCode: string | undefined, config?: any) => {
  return useQuery({
    queryKey: ["tenant", tenantCode],
    queryFn: () => {
      if (!tenantCode) {
        throw new Error("tenantCode is required");
      }
      return httpRequestGetTenantByCode(tenantCode);
    },
    enabled: !!tenantCode,
    ...config,
  });
};

export { httpRequestGetTenants, httpRequestGetTenantByCode, useQueryTenants, useQueryTenantByCode };
