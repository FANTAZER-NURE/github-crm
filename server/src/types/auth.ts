import { User } from "../generated/prisma";

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  status: number;
  // user?: {
  //   id: number;
  //   email: string;
  //   name: string;
  // };
  // token?: string;
}

export interface LoginResponse extends AuthResponse {
  token?: string;
}

export interface RefreshTokenResponse extends AuthResponse {
  token?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GetUserByIdResponse extends AuthResponse {
  user?: User;
}
