/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Params from './params';
import * as Endpoints from './endpoints';
import { AxiosInstance, ResponseType } from 'axios';

export { Endpoints, Params };

export interface GetConfig {
  headers?: any;
  timeout?: number;
  queryParams?: Record<string, any>;
}

export interface PostConfig {
  headers?: any;
  timeout?: number;
  queryParams?: Record<string, any>;
}
export interface PutConfig {
  headers?: any;
  timeout?: number;
  queryParams?: Record<string, any>;
}
export interface PatchConfig {
  headers?: any;
  timeout?: number;
  queryParams?: Record<string, any>;
}

export const makeApi = (axiosInstance: AxiosInstance) => {
  return {
    getApi: makeGetApi(axiosInstance),
    postApi: makePostApi(axiosInstance),
    putApi: makePutApi(axiosInstance),
    deleteApi: makeDeleteApi(axiosInstance),
  };
};

const makeGetApi = (axiosInstance: AxiosInstance) => {
  return async function getApi<T extends keyof Endpoints.GET>(
    url: T,
    params?: Endpoints.GET[T]['params'],
    config?: {
      headers?: any;
    }
  ): Promise<Endpoints.GET[T]['result']> {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axiosInstance.get(url, {
        params,
        headers: config?.headers,
      });
      return response.data;
    } catch (error) {
      throw error; // This error will be caught by useQuery
    }
  };
};

const makePostApi = (axiosInstance: AxiosInstance) => {
  return async function postApi<T extends keyof Endpoints.POST>(
    url: T,
    data: Endpoints.POST[T]['params'],
    config?: {
      headers?: any;
      timeout?: number;
      responseType?: ResponseType;
    }
  ): Promise<Endpoints.POST[T]['result']> {
    const result = await axiosInstance.post(url, data, config);
    return result.data;
  };
};

const makePutApi = (axiosInstance: AxiosInstance) => {
  return async function putApi<T extends keyof Endpoints.PUT>(
    url: T,
    data: Endpoints.PUT[T]['params'],
    config?: {
      headers?: any;
      timeout?: number;
    }
  ): Promise<Endpoints.PUT[T]['result']> {
    const result = await axiosInstance.put(url, data, config);
    return result.data;
  };
};

const makeDeleteApi = (axiosInstance: AxiosInstance) => {
  return async function putApi<T extends keyof Endpoints.DELETE>(
    url: T,
    params?: Endpoints.DELETE[T]['params']
  ): Promise<Endpoints.DELETE[T]['result']> {
    const result = await axiosInstance.delete(url, {
      params,
    });
    return result.data;
  };
};
