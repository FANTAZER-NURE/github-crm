export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  token?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
}
