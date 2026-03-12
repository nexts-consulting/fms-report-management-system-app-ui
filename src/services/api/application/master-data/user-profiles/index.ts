import { supabaseMasterService } from "@/services/supabase";
import type { IUserProfile } from "@/types/model";

export type UpsertUserProfilePayload = {
  keycloak_user_id: string;
  keycloak_username: string;
  employee_code?: string | null;
  fullname: string;
  gender?: string | null;
  date_of_birth?: string | null;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  national_id_issue_date?: string | null;
  national_id_issue_place?: string | null;
  payment_account_number?: string | null;
  payment_account_name?: string | null;
  payment_account_bank?: string | null;
  payment_account_branch?: string | null;
  address_line?: string | null;
  ward?: string | null;
  province?: string | null;
  country?: string | null;
  portrait_image_url?: string | null;
  national_id_front_url?: string | null;
  national_id_back_url?: string | null;
  hire_date?: string | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  position?: string | null;
  department?: string | null;
  is_active?: boolean | null;
  projects?: string[] | null;
};

export const httpRequestGetUserProfileByKeycloakId = async (
  keycloakUserId: string,
): Promise<IUserProfile | null> => {
  try {
    const { data, error } = await supabaseMasterService.client
      .from("user_profiles")
      .select("*")
      .eq("keycloak_user_id", keycloakUserId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as IUserProfile | null) ?? null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const httpRequestUpsertUserProfile = async (
  payload: UpsertUserProfilePayload,
): Promise<IUserProfile> => {
  try {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value]),
    );

    const { data, error } = await supabaseMasterService.client
      .from("user_profiles")
      .upsert(cleanPayload, {
        onConflict: "keycloak_user_id",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as IUserProfile;
  } catch (error) {
    console.error("Error upserting user profile:", error);
    throw error;
  }
};
