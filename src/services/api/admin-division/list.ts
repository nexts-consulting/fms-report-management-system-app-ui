import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { httpRequestGetAdminDivisions } from "@/services/application/management/master-data/admin-divisions-fms";
import { IAdminDivision } from "@/services/application/management/master-data/admin-divisions-fms";
import { useQuery } from "react-query";

type HttpRequestAdminDivisionListParams = {
  project_code: string;
};

type AdminDivisionListResponseData = {
  data: IAdminDivision[];
};

const httpRequestAdminDivisionList = async (
  params: HttpRequestAdminDivisionListParams,
): Promise<AdminDivisionListResponseData> => {
  try {
    const data = await httpRequestGetAdminDivisions(params.project_code);
    return { data };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestAdminDivisionList;

type QueryOptions = {
  params: HttpRequestAdminDivisionListParams;
  config?: QueryConfig<QueryFnType>;
};

const useQueryAdminDivisionList = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/admin-division/list", params],
    queryFn: () => httpRequestAdminDivisionList(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.project_code,
    ...config,
  });
};

export { httpRequestAdminDivisionList, useQueryAdminDivisionList };
export type { AdminDivisionListResponseData };

