import { axiosApi } from "@/libs/axios";
import { useMutation } from "react-query";
import { MutationConfig } from "@/libs/react-query";

export type HttpRequestCreateStaffLeaveParams = {
  attendanceId: number;
  leaveType: string;
  note?: string;
};

export const httpRequestCreateStaffLeave = async (params: HttpRequestCreateStaffLeaveParams) => {
  const payload = {
    attendanceId: params.attendanceId,
    leaveType: params.leaveType,
    note: params.note,
  };

  try {
    const res = await axiosApi.post(`/staff-leaves`, payload, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationOptions = {
  config?: MutationConfig<typeof httpRequestCreateStaffLeave>;
};

export const useMutationCreateStaffLeave = ({ config }: UseMutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCreateStaffLeave,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};
