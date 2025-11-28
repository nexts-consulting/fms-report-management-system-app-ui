import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { useQuery } from "react-query";

type VerifyMeResponseData = {
  data: { id: number; username: string; role: string; isActive: boolean };
};

const httpRequestMeVerify = async (): Promise<VerifyMeResponseData> => {
  try {
    const res = await axiosApi.get(`api/auth/verify`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestMeVerify;

type QueryOptions = {
  config?: QueryConfig<QueryFnType>;
};

const useQueryMeVerify = ({ config }: QueryOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/auth/verify"],
    queryFn: () => httpRequestMeVerify(),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestMeVerify, useQueryMeVerify };
export type { VerifyMeResponseData };
