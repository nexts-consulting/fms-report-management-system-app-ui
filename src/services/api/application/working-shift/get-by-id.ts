import { httpRequestGetWorkshiftById } from "@/services/api/application/working-shift";
import { IWorkshift } from "@/types/model";
import { useQuery } from "react-query";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";

export type HttpRequestWorkshiftByIdParams = {
  id: number;
};

export type WorkshiftByIdResponseData = {
  data: IWorkshift | null;
};

export const httpRequestWorkshiftById = async (
  params: HttpRequestWorkshiftByIdParams,
): Promise<WorkshiftByIdResponseData> => {
  try {
    const data = await httpRequestGetWorkshiftById(params.id);
    return { data };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestWorkshiftById;

type QueryOptions = {
  params: HttpRequestWorkshiftByIdParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryWorkshiftById = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/working-shift/get-by-id", params],
    queryFn: () => httpRequestWorkshiftById(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!params.id,
    ...config,
  });
};
