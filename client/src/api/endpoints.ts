import * as Models from './models';

// Define response interfaces
export interface RepositoriesResponse {
  success: boolean;
  repositories: Models.Repository[];
  message?: string;
}

export interface GET {
  '/github/repositories': {
    params: {
      search?: string;
    };
    result: RepositoriesResponse;
  };
  '/github/repositories/:id': {
    params: never;
    result: Models.Repository;
  };
  '/github/search': {
    params: {
      search: string;
    };
    result: RepositoriesResponse;
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

export interface PUT {
  '/github/repositories/:id': {
    params: {
      name?: string;
      description?: string;
      url?: string;
      refresh?: boolean;
    };
    result: Models.Repository;
  };
}

export interface DELETE {
  '/github/repositories/:id': {
    params: never;
    result: {
      success: boolean;
      message: string;
    };
  };
}
