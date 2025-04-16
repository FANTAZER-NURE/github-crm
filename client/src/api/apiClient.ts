import { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as Endpoints from './endpoints';

// Common config type used across methods
type RequestConfig = {
  headers?: Record<string, string>;
  timeout?: number;
};

// Generic method factory to reduce duplication
const createApiMethod = <
  M extends 'get' | 'post' | 'put' | 'delete',
  E extends
    | keyof Endpoints.GET
    | keyof Endpoints.POST
    | keyof Endpoints.PUT
    | keyof Endpoints.DELETE,
  P = unknown,
  R = unknown
>(
  axiosInstance: AxiosInstance,
  method: M,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _paramsInBody: boolean = false
) => {
  return async function apiMethod<T extends E>(
    url: T,
    params?: P,
    config?: RequestConfig
  ): Promise<R> {
    const axiosConfig: AxiosRequestConfig = {
      headers: config?.headers,
      timeout: config?.timeout,
    };

    let response;
    if (method === 'get' || method === 'delete') {
      axiosConfig.params = params;
      response = await axiosInstance[method](url as string, axiosConfig);
    } else {
      response = await axiosInstance[method](
        url as string,
        params,
        axiosConfig
      );
    }

    return response.data;
  };
};

export const makeApi = (axiosInstance: AxiosInstance) => {
  return {
    getApi: createApiMethod<
      'get',
      keyof Endpoints.GET,
      Endpoints.GET[keyof Endpoints.GET]['params'],
      Endpoints.GET[keyof Endpoints.GET]['result']
    >(axiosInstance, 'get'),

    postApi: createApiMethod<
      'post',
      keyof Endpoints.POST,
      Endpoints.POST[keyof Endpoints.POST]['params'],
      Endpoints.POST[keyof Endpoints.POST]['result']
    >(axiosInstance, 'post', true),

    putApi: createApiMethod<
      'put',
      keyof Endpoints.PUT,
      Endpoints.PUT[keyof Endpoints.PUT]['params'],
      Endpoints.PUT[keyof Endpoints.PUT]['result']
    >(axiosInstance, 'put', true),

    deleteApi: createApiMethod<
      'delete',
      keyof Endpoints.DELETE,
      Endpoints.DELETE[keyof Endpoints.DELETE]['params'],
      Endpoints.DELETE[keyof Endpoints.DELETE]['result']
    >(axiosInstance, 'delete'),
  };
};
