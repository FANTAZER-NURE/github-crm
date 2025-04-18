import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { makeApi } from './makeApi';
import { API_URL } from '../utils/constants';
import { refresh } from '../features/auth/api/authApi';
import { tokenService } from '../utils/tokenService';

export const privateHttpClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

privateHttpClient.interceptors.request.use(onRequest);
privateHttpClient.interceptors.response.use(onResponseSuccess, onResponseError);

function onRequest(request: InternalAxiosRequestConfig) {
  const token = tokenService.getToken();

  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }

  return request;
}

function onResponseSuccess(res: AxiosResponse) {
  return res;
}

async function onResponseError(error: {
  config: InternalAxiosRequestConfig;
  response: { status: number };
}) {
  const originalRequest = error.config;

  if (error.response.status !== 401) {
    return Promise.reject(error);
  }

  try {
    const response = await refreshTokenRequest();

    if (response.success && response.token) {
      tokenService.saveToken(response.token);
      return privateHttpClient.request(originalRequest);
    }
    tokenService.removeToken();
    return;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function refreshTokenRequest() {
  return await refresh();
}

const { getApi, postApi, putApi, deleteApi } = makeApi(privateHttpClient);

export { getApi, postApi, putApi, deleteApi };
