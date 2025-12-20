import { axiosApi } from "@/libs/axios";
import { useMutation } from "react-query";
import { MutationConfig } from "@/libs/react-query";

export type HttpRequestEndStaffLeaveParams = {
  leaveId: number;
};

export const httpRequestEndStaffLeave = async (params: HttpRequestEndStaffLeaveParams) => {
  try {
    const res = await axiosApi.put(`/staff-leaves/${params.leaveId}`, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseEndMutationOptions = {
  config?: MutationConfig<typeof httpRequestEndStaffLeave>;
};

export const useMutationEndStaffLeave = ({ config }: UseEndMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestEndStaffLeave,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};
