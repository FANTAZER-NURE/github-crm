import { getApi } from '../../../api/privateHttpClient';
import { authPostApi } from '../../../api/authClient';

export function register({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  return authPostApi('/auth/register', { name, email, password });
}

export function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return authPostApi('/auth/login', { email, password });
}

export function refresh() {
  return getApi('/auth/refresh-token');
}

export async function logout() {
  return await getApi('/auth/logout');
}

export async function getProfile() {
  return await getApi('/auth/profile');
}
