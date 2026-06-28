import { AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from "axios";

export const mockAxiosSuccess = <T>(data: T, status = 200, headers: Record<string, string> = {}): AxiosResponse<T> => ({
  data,
  status,
  statusText: "OK",
  headers,
  config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
});

export const mockAxiosError = (status: number, message: string, data?: any): AxiosError => {
  const error = new AxiosError(message, "ERR_BAD_REQUEST", { headers: new AxiosHeaders() } as InternalAxiosRequestConfig);
  error.response = {
    data: data || { message },
    status,
    statusText: "Error",
    headers: {},
    config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
  };
  return error;
};

export const mockNetworkError = (): AxiosError => {
  const error = new AxiosError("Network Error", "ERR_NETWORK", { headers: new AxiosHeaders() } as InternalAxiosRequestConfig);
  return error;
};

export const mockFetchSuccess = <T>(data: T, status = 200): Response => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    statusText: "OK",
  } as Response;
};

export const mockFetchError = (status: number, data: any): Response => {
  return {
    ok: false,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    statusText: "Error",
  } as Response;
};
