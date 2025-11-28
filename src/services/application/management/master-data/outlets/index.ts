import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { useQuery } from "react-query";

// Types for Outlet API
export interface Outlet {
  id: number;
  code: string;
  name: string;
  provinceText: string | null;
  districtText: string | null;
  wardText: string | null;
  adminDivisionText: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  checkinRadiusMeters: number;
  createdAt: string;
  updatedAt: string;
  defaultShifts: any[];
}

export interface PaginatedResponse<T> {
  content: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data?: T;
  content?: T[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
}

// Get Outlets List
export type GetOutletsParams = {
  page?: number;
  size?: number;
  search?: string;
  adminDivisionId?: number;
};

const httpRequestGetOutlets = async (
  params: GetOutletsParams = {},
): Promise<PaginatedResponse<Outlet>> => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.append("page", params.page.toString());
  if (params.size !== undefined) searchParams.append("size", params.size.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.adminDivisionId) searchParams.append("adminDivisionId", params.adminDivisionId.toString());

  try {
    const res = await axiosApi.get(`/api/admin/outlets?${searchParams.toString()}`);
    return {
      content: res.data.content,
      pagination: res.data.pagination,
    };
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestGetOutlets;

type UseQueryGetOutletsOptions = {
  params?: GetOutletsParams;
  config?: QueryConfig<QueryFnType>;
};

export const useQueryGetOutlets = ({ params, config }: UseQueryGetOutletsOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/admin/outlets", params],
    queryFn: () => httpRequestGetOutlets(params),
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...config,
  });
};
