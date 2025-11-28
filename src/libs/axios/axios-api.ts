import Axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import moment from "moment";

export const axios = Axios.create();

const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const timestamp = moment.utc().format("X");

  config.baseURL = `${process.env.NEXT_PUBLIC_API_URL}/v1`;
  config.headers["Accept"] = "application/json";
  config.headers["x-request-timestamp"] = timestamp;

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
