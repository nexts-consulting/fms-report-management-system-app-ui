import { axiosApi } from "@/libs/axios";
import { useMutation } from "react-query";
import { MutationConfig } from "@/libs/react-query";
import { DataUtil } from "@/utils/data.util";

interface CustomerFindByPhoneNumberResponseData {
  message: string;
  status: number;
  data: {
    id: number;
    name: string;
    phoneNumber: string;
    isVerified: boolean;
    verifiedMethod: string;
    isSurveyReported: boolean;
    isReceivedSurveyGift: boolean;
    giftReceivedAt: string;
    receivedGift: string;
  };
}

const httpRequestCustomerFindByPhoneNumber = async (
  phoneNumber: string,
): Promise<CustomerFindByPhoneNumberResponseData> => {
  try {
    const res = await axiosApi.get(`/customer-data/find-by-phone-number`, {
      params: {
        phoneNumber,
      },
    });
    return DataUtil.transformData(res.data);
  } catch (error) {
    throw error;
  }
};

type MutationFnType = typeof httpRequestCustomerFindByPhoneNumber;

type MutationOptions = {
  config?: MutationConfig<MutationFnType>;
};

const useMutationCustomerFindByPhoneNumber = ({ config }: MutationOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestCustomerFindByPhoneNumber,
    ...config,
  });
};

export { httpRequestCustomerFindByPhoneNumber, useMutationCustomerFindByPhoneNumber };
export type { CustomerFindByPhoneNumberResponseData };
