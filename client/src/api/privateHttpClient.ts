import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { makeApi } from './makeApi';
import { API_URL } from '../utils/constants';
import { refresh } from '../features/auth/api/authApi';
import { tokenService } from '../utils/tokenService';
// import Router from "next/router"
// import {refresh} from "@/features/auth/api/authApi"

export const privateHttpClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Global variable to track the refresh token request

privateHttpClient.interceptors.request.use(onRequest);
privateHttpClient.interceptors.response.use(onResponseSuccess, onResponseError);

function onRequest(request: InternalAxiosRequestConfig) {
  const token = tokenService.getToken();
  console.log('accessToken', token);

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

    console.log('response.token', response);
    if (response.success && response.token) {
      tokenService.saveToken(response.token);
      return privateHttpClient.request(originalRequest);
    }

    // const { access_token, refresh_token } = response;
    // tokenService.saveAccess(access_token);
    // tokenService.saveRefresh(refresh_token);
    tokenService.removeToken();
    return;
  } catch (error) {
    return Promise.reject(error);
  }

  // If a refresh token request is already in progress, wait for it to complete
  // if (isRefreshing) {
  //   try {
  //     await refreshTokenPromise;
  //   } catch (error) {
  //     return Promise.reject(error);
  //   }
  // } else {
  //   // Otherwise, start a new refresh token request
  //   isRefreshing = true;
  //   refreshTokenPromise = refreshTokenRequest();

  //   const { access_token, refresh_token } = await refreshTokenPromise;

  //   tokenService.saveAccess(access_token);
  //   tokenService.saveRefresh(refresh_token);
  // }

  // try {
  //   const newAccessToken = tokenService.getAccess();
  //   originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  //   return privateHttpClient.request(originalRequest);
  // } catch (error) {
  //   tokenService.removeAccess();
  //   tokenService.removeRefresh();

  //   window.location.href = '/login';
  //   return Promise.reject(error);
  // }
}

async function refreshTokenRequest() {
  return await refresh();
}

const { getApi, postApi, putApi, deleteApi } = makeApi(privateHttpClient);

export { getApi, postApi, putApi, deleteApi };
