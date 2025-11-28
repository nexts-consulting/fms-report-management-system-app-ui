import { axiosApi } from "@/libs/axios";
import { useMutation } from "react-query";
import { MutationConfig } from "@/libs/react-query";
import { DataUtil } from "@/utils/data.util";

type HttpRequestSurveySaveBody = {};

type SurveySaveResponseData = {};

const httpRequestSurveySave = async (
  body: HttpRequestSurveySaveBody,
): Promise<SurveySaveResponseData> => {
  try {
    const res = await axiosApi.post(`/customer-data/submit`, body);
    return DataUtil.transformData(res.data);
  } catch (error) {
    throw error;
  }
};

type MutationFnType = typeof httpRequestSurveySave;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

const useMutationSurveySave = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestSurveySave,
    ...config,
  });
};

export { httpRequestSurveySave, useMutationSurveySave };
export type { SurveySaveResponseData };
