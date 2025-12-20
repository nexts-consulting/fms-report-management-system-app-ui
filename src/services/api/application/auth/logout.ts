import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

export type HttpRequestAuthLogoutParams = {
  deviceId?: string;
};

type AuthLogoutRequestBody = {
  deviceId?: string;
};

export type AuthLogoutResponseData = {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
};

export const httpRequestAuthLogout = async (
  params: HttpRequestAuthLogoutParams = {},
): Promise<AuthLogoutResponseData> => {
  const body: AuthLogoutRequestBody = {
    deviceId: params.deviceId,
  };

  try {
    const res = await axiosApi.post(`/api/auth/logout`, body, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};


type MutationFnType = typeof httpRequestAuthLogout;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

export const useMutationAuthLogout = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAuthLogout,
    ...config,
  });
};
  