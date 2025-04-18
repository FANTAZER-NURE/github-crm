import * as Models from './models';

export interface GET {
  '/github/repositories': {
    params: {
      search?: string;
    };
    result: Models.RepositoriesResponse;
  };
  '/github/repositories/:id': {
    params: never;
    result: Models.Repository;
  };
  '/github/search': {
    params: {
      query: string;
    };
    result: Models.RepositoriesResponse;
  };
  '/auth/profile': {
    params: never;
    result: Models.ProfileResponse;
  };
  '/auth/refresh-token': {
    params: never;
    result: Models.RefreshTokenResponse;
  };
  '/auth/logout': {
    params: never;
    result: {
      success: boolean;
      message: string;
    };
  };
  '/github/repositories/refresh/:id': {
    params: {
      name?: string;
      description?: string;
      url?: string;
    };
    result: Models.Repository;
  };
}

export interface POST {
  '/github/repositories': {
    params: Models.Repository | { repoPath: string };
    result: Models.Repository;
  };
  '/auth/login': {
    params: {
      email: string;
      password: string;
    };
    result: Models.AuthResponse;
  };
  '/auth/register': {
    params: {
      name: string;
      email: string;
      password: string;
    };
    result: Models.RegisterResponse;
  };
}

export type PUT = object;

export interface DELETE {
  '/github/repositories/:id': {
    params: never;
    result: {
      success: boolean;
      message: string;
    };
  };
}
