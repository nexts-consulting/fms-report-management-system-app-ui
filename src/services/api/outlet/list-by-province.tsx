import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { IOutlet } from "@/types/model";
import { useQuery } from "react-query";

type HttpRequestOutletByProvinceList = {
  provinceId: number;
};

type OutletByProvinceListResponseData = {
  data: IOutlet[];
};

const httpRequestOutletByProvinceList = async (
  params: HttpRequestOutletByProvinceList,
): Promise<OutletByProvinceListResponseData> => {
  try {
    const res = await axiosApi.get(`/outlets/by-province/${params.provinceId}`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestOutletByProvinceList;

type QueryOptions = {
  params: HttpRequestOutletByProvinceList;
  config?: QueryConfig<QueryFnType>;
};

const useQueryOutletByProvinceList = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/outlet/list-by-province", params],
    queryFn: () => httpRequestOutletByProvinceList(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestOutletByProvinceList, useQueryOutletByProvinceList };
export type { OutletByProvinceListResponseData };
