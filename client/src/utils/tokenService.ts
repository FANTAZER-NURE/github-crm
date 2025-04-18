import Cookies from 'js-cookie';

const accessTokenKey = 'authToken';

function getToken() {
  return Cookies.get(accessTokenKey);
}

function saveToken(token: string) {
  return Cookies.set(accessTokenKey, token);
}

function removeToken() {
  return Cookies.remove(accessTokenKey);
}

export const tokenService = {
  getToken,
  saveToken,
  removeToken,
};
