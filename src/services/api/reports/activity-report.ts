import { axiosApi } from "@/libs/axios";
import { MutationConfig } from "@/libs/react-query";
import { useMutation } from "react-query";

type HttpRequestUploadActivityImagesParams = {
  attendanceId: number;
  images: File[];
};

type HttpRequestUploadActivityImagesResponse = {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    url: string;
  }[];
};

const httpRequestUploadActivityImages = async (
  params: HttpRequestUploadActivityImagesParams,
): Promise<HttpRequestUploadActivityImagesResponse> => {
  const formData = new FormData();
  formData.append("attendanceId", params.attendanceId.toString());
  
  params.images.forEach((image, index) => {
    formData.append(`images`, image);
  });

  try {
    const res = await axiosApi.post(`/reports/activity/upload`, formData, {
      timeout: 60000, // 60 seconds for image upload
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type HttpRequestGetActivityReportParams = {
  attendanceId: number;
};

type HttpRequestGetActivityReportResponse = {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    url: string;
  }[];
};

const httpRequestGetActivityReport = async (
  params: HttpRequestGetActivityReportParams,
): Promise<HttpRequestGetActivityReportResponse> => {
  try {
    const res = await axiosApi.get(`/reports/activity/${params.attendanceId}`, {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

type HttpRequestDeleteActivityImageParams = {
  attendanceId: number;
  fileId: string;
};

const httpRequestDeleteActivityImage = async (
  params: HttpRequestDeleteActivityImageParams,
): Promise<{ success: boolean }> => {
  try {
    const res = await axiosApi.delete(
      `/reports/activity/${params.attendanceId}/image/${params.fileId}`,
      {
        timeout: 30000,
      },
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

type UseMutationUploadOptions = {
  config?: MutationConfig<typeof httpRequestUploadActivityImages>;
};

const useMutationUploadActivityImages = ({ config }: UseMutationUploadOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestUploadActivityImages,
    retry: 3,
    retryDelay: 1000,
    ...config,
  });
};

type UseMutationDeleteOptions = {
  config?: MutationConfig<typeof httpRequestDeleteActivityImage>;
};

const useMutationDeleteActivityImage = ({ config }: UseMutationDeleteOptions = {}) => {
  return useMutation({
    mutationFn: httpRequestDeleteActivityImage,
    retry: 3,
    retryDelay: 1000,
    ...config,
  });
};

export {
  httpRequestUploadActivityImages,
  httpRequestGetActivityReport,
  httpRequestDeleteActivityImage,
  useMutationUploadActivityImages,
  useMutationDeleteActivityImage,
};

export type {
  HttpRequestUploadActivityImagesParams,
  HttpRequestUploadActivityImagesResponse,
  HttpRequestGetActivityReportParams,
  HttpRequestGetActivityReportResponse,
  HttpRequestDeleteActivityImageParams,
};
