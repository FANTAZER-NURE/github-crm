import { AuthResponse } from './auth';

export interface GithubRepoData {
  id?: number;
  owner: string;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  issues: number;
  ownerAvatarUrl: string;
  createdAt: Date;
  updatedAt?: Date;
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
  owner: string;
  ownerAvatarUrl: string;
  createdAt: number | string;
}

export interface UpdateGithubRepoData {
  id: number;
  name?: string;
  description?: string;
  url?: string;
  refresh?: boolean;
}

export interface GithubApiRepositoriesResponse {
  id: number;

  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  name: string;
  description: string;
  html_url: string;
}

export interface GithubRepoResponse extends AuthResponse {
  repository?: GithubRepoData;
}

export interface GithubReposResponse extends AuthResponse {
  repositories?: GithubRepoData[];
}
