import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";
import { serialize } from "object-to-formdata";
import { IStaffAttendance } from "@/types/model";

type HttpRequestAttendanceCheckinParams = {
  staffId: number;
  shiftId: number;
  location: {
    lat: number;
    lng: number;
    acc: number;
  };
  file: File;
};

type AttendanceCheckinResponseData = {
  success: boolean;
  data: IStaffAttendance;
};

const httpRequestAttendanceCheckin = async (
  params: HttpRequestAttendanceCheckinParams,
): Promise<AttendanceCheckinResponseData> => {
  const payload = {
    staffId: params.staffId,
    shiftId: params.shiftId,
    location: params.location,
    file: params.file,
  };

  const formData = serialize(payload, {
    indices: false,
    booleansAsIntegers: true,
    nullsAsUndefineds: true,
    dotsForObjectNotation: true,
  });

  try {
    const res = await axiosApi.post(`/attendance/checkin`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type MutationFnType = typeof httpRequestAttendanceCheckin;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

const useMutationAttendanceCheckin = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAttendanceCheckin,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};

export { httpRequestAttendanceCheckin, useMutationAttendanceCheckin };
export type { AttendanceCheckinResponseData };
