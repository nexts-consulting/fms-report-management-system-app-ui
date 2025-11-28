import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { useQuery } from "react-query";

interface ICustomerExtra {
  gender: string;
  address: string;
  birthYear: number;
  childrenCount: number;
  maritalStatus: string;
}

interface ISurveyReport {
  brands: string[];
  surveyMode: string;
  completedAt: string;
  flavorUsage: string[];
  frequentBrand: string[];
  mostUsedFlavor: string;
  mostFrequentBrand: string;
}

interface ICustomer {
  id: number;
  name: string;
  phoneNumber: string;
  isVerified: boolean;
  verifiedMethod: string;
  otp: string | null;
  image: string;
  extra: ICustomerExtra;
  saleReports: any | null;
  surveyReport: ISurveyReport | null;
  games: string[];
  receivedGift: string;
  createdAt: string;
  surveyCreatedAt: string;
  giftReceivedAt: string;
  updatedAt: string;
  saleReportBy: any | null;
  workShift: any | null;
}

interface IPageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

interface ICustomerListResponse {
  content: ICustomer[];
  pageable: IPageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

type HttpRequestCustomerList = {
  date: string;
  page?: number;
  size?: number;
};

type CustomerListResponseData = {
  message: string;
  status: number;
  data: ICustomerListResponse;
};

const httpRequestCustomerList = async (
  params: HttpRequestCustomerList,
): Promise<CustomerListResponseData> => {
  try {
    const { date, page = 0, size = 10 } = params;
    const res = await axiosApi.get(`/customer-data`, {
      params: {
        date,
        page,
        size,
      },
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestCustomerList;

type QueryOptions = {
  params: HttpRequestCustomerList;
  config?: QueryConfig<QueryFnType>;
};

const useQueryCustomerList = ({ params, config }: QueryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/customer/list", params],
    queryFn: () => httpRequestCustomerList(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};

export { httpRequestCustomerList, useQueryCustomerList };
export type { CustomerListResponseData, ICustomer, HttpRequestCustomerList };

