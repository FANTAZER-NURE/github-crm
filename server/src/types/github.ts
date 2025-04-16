export interface GithubRepoData {
  id?: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  ownerAvatarUrl?: string;
  createdAt: string; // UTC Unix timestamp as string
}

export interface AddGithubRepoData {
  repoPath?: string; // Format: "owner/name"
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

export interface UpdateGithubRepoData {
  id: number;
  name?: string;
  description?: string;
  url?: string;
  refresh?: boolean;
}

export interface GithubRepoResponse {
  success: boolean;
  message?: string;
  repository?: GithubRepoData;
}

export interface GithubReposResponse {
  success: boolean;
  message?: string;
  repositories?: GithubRepoData[];
}
