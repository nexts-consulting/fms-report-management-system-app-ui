import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

type HttpRequestCreateSamplingReportParams = {
  attendanceId: number;
  data: Record<string, any>[];
};

const httpRequestCreateSamplingReport = async (params: HttpRequestCreateSamplingReportParams) => {
  const payload = {
    attendanceId: params.attendanceId,
    data: params.data,
  };

  try {
    const res = await axiosApi.post(`/reports/sampling`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationOptions = {
  config?: MutationConfig<typeof httpRequestCreateSamplingReport>;
};

const useMutationCreateSamplingReport = ({ config }: UseMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateSamplingReport,
    ...config,
  });
};

export { httpRequestCreateSamplingReport, useMutationCreateSamplingReport };
export type { HttpRequestCreateSamplingReportParams };
