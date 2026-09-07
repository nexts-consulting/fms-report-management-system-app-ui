import Axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import moment from "moment";
import { getAccessTokenCookie } from "@/utils/cookie";
import { weaveAxios } from "@/libs/observability";

export const axios = Axios.create();

const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const timestamp = moment.utc().format("X");

  config.baseURL = `${process.env.NEXT_PUBLIC_API_URL}/v1`;
  config.headers["Accept"] = "application/json";
  config.headers["x-request-timestamp"] = timestamp;

  // Get access token from secure cookie storage
  const accessToken = getAccessTokenCookie();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Get tenant code from localStorage (non-sensitive)
  if (typeof window !== "undefined") {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const authData = JSON.parse(authStorage || "{}");
      const tenantCode = authData.state?.tenant?.code;
      
      if (tenantCode) {
        config.headers["x-tenant-code"] = tenantCode;
      }
    } catch (error) {
      console.warn("⚠️ Failed to read tenant from auth storage:", error);
    }
  }

  // console.info(`[⚡ request] [${config.method}:${config.url}]`);
  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  // console.error(`[📛 request error]`, error);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  // console.info(`[🔥 response] `, response);
  return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  // console.error(`[📛 response error]`, error);
  return Promise.reject(error);
};

axios.interceptors.request.use(onRequest, onRequestError);
axios.interceptors.response.use(onResponse, onResponseError);
weaveAxios(axios);
