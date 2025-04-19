import axios from 'axios';
import { makeApi } from './makeApi';
import { API_URL } from '../utils/constants';

export const authHttp = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const {
  getApi: authGetApi,
  postApi: authPostApi,
  putApi: authPutApi,
  deleteApi: authDeleteApi,
} = makeApi(authHttp);

export { authGetApi, authPostApi, authPutApi, authDeleteApi };
