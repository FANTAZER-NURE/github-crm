export interface Repository {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  createdAt: number | string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}
