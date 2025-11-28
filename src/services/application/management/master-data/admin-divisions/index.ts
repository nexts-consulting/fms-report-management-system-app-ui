import { axiosApi } from "@/libs/axios";
import { ExtractFnReturnType, QueryConfig } from "@/libs/react-query";
import { useQuery } from "react-query";

// Types for Admin Division API
export interface AdminDivision {
  id: number;
  name: string;
  children: AdminDivision[];
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

// Get Admin Divisions Hierarchy
const httpRequestGetAdminDivisions = async (): Promise<AdminDivision[]> => {
  try {
    const res = await axiosApi.get(`/api/admin/admin-divisions`);
    return res.data.data;
  } catch (error) {
    throw error;
  }
};

type QueryFnType = typeof httpRequestGetAdminDivisions;

type UseQueryGetAdminDivisionsOptions = {
  config?: QueryConfig<QueryFnType>;
};

export const useQueryGetAdminDivisions = ({ config }: UseQueryGetAdminDivisionsOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["query/admin/admin-divisions"],
    queryFn: httpRequestGetAdminDivisions,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...config,
  });
};
