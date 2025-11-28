import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { IUserAccount, IStaffProfile, ISaleProfile } from "@/types/model";
import { DataUtil } from "@/utils/data.util";
import { useMutation } from "react-query";

type HttpRequestAuthLoginParams = {
  username: string;
  password: string;
};

type AuthLoginRequestBody = {
  username: string;
  password: string;
};

type AuthLoginResponseData = {
  token: string;
  profile:
    | (IStaffProfile & {
        account: IUserAccount;
      })
    | (ISaleProfile & {
        account: IUserAccount;
      })
    | null;
};

const httpRequestAuthLogin = async (
  params: HttpRequestAuthLoginParams,
): Promise<AuthLoginResponseData> => {
  const body: AuthLoginRequestBody = {
    username: params.username,
    password: params.password,
  };

  try {
    const res = await axiosApi.post(`/auth/login`, body, {
      timeout: 30000,
    });
    return DataUtil.transformData(res.data);
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
