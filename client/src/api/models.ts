export interface Repository {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  owner: string;
  ownerAvatarUrl: string;
  createdAt: number | string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export interface RepositoriesResponse {
  success: boolean;
  repositories: Repository[];
  message?: string;
}
