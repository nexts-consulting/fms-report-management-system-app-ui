import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

type HttpRequestCreateOOSReportParams = {
  attendanceId: number;
  data: Record<string, any>[];
};

const httpRequestCreateOOSReport = async (params: HttpRequestCreateOOSReportParams) => {
  const payload = {
    attendanceId: params.attendanceId,
    data: params.data,
  };

  try {
    const res = await axiosApi.post(`/reports/oos`, payload, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationOptions = {
  config?: MutationConfig<typeof httpRequestCreateOOSReport>;
};

const useMutationCreateOOSReport = ({ config }: UseMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateOOSReport,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};

export { httpRequestCreateOOSReport, useMutationCreateOOSReport };
export type { HttpRequestCreateOOSReportParams };
