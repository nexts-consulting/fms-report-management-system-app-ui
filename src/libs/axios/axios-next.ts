import Axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const axios = Axios.create();

const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  config.baseURL = ``;
  config.headers["Accept"] = "application/json";

  // console.info(`[⚡ request] [${config.method}:${config.url}]`, config);
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
