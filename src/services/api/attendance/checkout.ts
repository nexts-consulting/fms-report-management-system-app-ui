import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { serialize } from "object-to-formdata";
import { useMutation } from "react-query";

type HttpRequestAttendanceCheckoutParams = {
  staffId: number;
  shiftId: number;
  location: {
    lat: number;
    lng: number;
    acc: number;
  };
  file: File;
};
type AttendanceCheckoutResponseData = {
  success: boolean;
};

const httpRequestAttendanceCheckout = async (
  params: HttpRequestAttendanceCheckoutParams,
): Promise<AttendanceCheckoutResponseData> => {
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
    const res = await axiosApi.post(`/attendance/checkout`, formData, {
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

type MutationFnType = typeof httpRequestAttendanceCheckout;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

const useMutationAttendanceCheckout = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestAttendanceCheckout,
    retry: 5,
    retryDelay: 1000,
    ...config,
  });
};

export { httpRequestAttendanceCheckout, useMutationAttendanceCheckout };
export type { AttendanceCheckoutResponseData };
