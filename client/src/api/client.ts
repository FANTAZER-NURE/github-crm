import axios from 'axios';
import { makeApi } from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for auth headers, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        const redirectPath = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${redirectPath}`;
      }
    }
    return Promise.reject(error);
  }
);

export const api = makeApi(axiosInstance);
