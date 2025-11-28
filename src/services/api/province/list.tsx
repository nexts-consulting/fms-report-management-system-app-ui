import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { IProvince } from "@/types/model";
import { useQuery } from "react-query";

type HttpRequestProvinceList = {};

type ProvincesListResponseData = {
  data: IProvince[];
};

const httpRequestProvinceList = async (
  params: HttpRequestProvinceList,
): Promise<ProvincesListResponseData> => {
  try {
    const res = await axiosApi.get(`/provinces`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestProvinceList;

type QueryOptions = {
  params: HttpRequestProvinceList;
  config?: QueryConfig<QueryFnType>;
};

const useQueryProvinceList = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/province/list", params],
    queryFn: () => httpRequestProvinceList(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestProvinceList, useQueryProvinceList };
export type { ProvincesListResponseData };
