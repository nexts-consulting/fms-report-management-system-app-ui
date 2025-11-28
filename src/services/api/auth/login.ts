import { MutationConfig } from "@/libs/react-query";
import { IUserAccount, IStaffProfile, ISaleProfile } from "@/types/model";
import { useMutation } from "react-query";
import Axios from "axios";

type HttpRequestAuthLoginParams = {
  username: string;
  password: string;
  tenantCode: string;
  keycloakBaseUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakClientSecret?: string | null;
};

type KeycloakTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  not_before_policy: number;
  session_state: string;
  scope: string;
};

type AuthLoginResponseData = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  notBeforePolicy: number;
  sessionState: string;
  scope: string;
};

/**
 * Login via Keycloak token endpoint
 * @param params - Login parameters including username, password, tenant and project info
 * @returns Token response from Keycloak
 */
const httpRequestAuthLogin = async (
  params: HttpRequestAuthLoginParams,
): Promise<AuthLoginResponseData> => {
  const { username, password, keycloakBaseUrl, keycloakClientId, keycloakClientSecret } = params;

  // Build Keycloak token endpoint URL
  const tokenEndpoint = `${keycloakBaseUrl}/realms/${params.keycloakRealm}/protocol/openid-connect/token`;

  // Prepare form data for Keycloak
  const formData = new URLSearchParams();
  formData.append("client_id", keycloakClientId);
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  // Add client_secret if provided
  if (keycloakClientSecret) {
    formData.append("client_secret", keycloakClientSecret);
  }

  try {
    const res = await Axios.post<KeycloakTokenResponse>(tokenEndpoint, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 30000,
      withCredentials: true, // Important for refresh_token cookie
    });

    // Transform Keycloak response to our format
    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      idToken: res.data.id_token,
      tokenType: res.data.token_type,
      expiresIn: res.data.expires_in,
      refreshExpiresIn: res.data.refresh_expires_in,
      notBeforePolicy: res.data.not_before_policy,
      sessionState: res.data.session_state,
      scope: res.data.scope,
    };
  } catch (error) {
    throw error;
  }
};

type MutationFnType = typeof httpRequestAuthLogin;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

const useMutationAuthLogin = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAuthLogin,
    ...config,
  });
};

export { httpRequestAuthLogin, useMutationAuthLogin };
export type { AuthLoginResponseData };
