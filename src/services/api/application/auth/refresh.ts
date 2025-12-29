import { MutationConfig } from "@/libs/react-query";
import Axios from "axios";
import { useMutation } from "react-query";

export type HttpRequestAuthRefreshParams = {
  refreshToken: string;
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

export type AuthRefreshResponseData = {
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
 * Refresh token via Keycloak token endpoint
 * @param params - Refresh parameters including refresh_token and tenant info
 * @returns New token response from Keycloak
 */
export const httpRequestAuthRefresh = async (
  params: HttpRequestAuthRefreshParams,
): Promise<AuthRefreshResponseData> => {
  const { refreshToken, keycloakBaseUrl, keycloakRealm, keycloakClientId, keycloakClientSecret } = params;

  // Build Keycloak token endpoint URL
  const tokenEndpoint = `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

  // Prepare form data for Keycloak
  const formData = new URLSearchParams();
  formData.append("client_id", keycloakClientId);
  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);

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

    console.log("Perform refresh token", res.data);
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


type MutationFnType = typeof httpRequestAuthRefresh;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

export const useMutationAuthRefresh = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAuthRefresh,
    ...config,
  });
};
