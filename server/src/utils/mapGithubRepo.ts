import { GithubRepoData, GithubApiRepositoriesResponse } from '../types/github';

export const mapGitHubRepo = (
  repo: GithubApiRepositoriesResponse
): GithubRepoData => ({
  id: repo.id,
  name: repo.name,
  description: repo.description || '',
  url: repo.html_url,
  stars: repo.stargazers_count,
  forks: repo.forks_count,
  issues: repo.open_issues_count,
  owner: repo.owner.login,
  ownerAvatarUrl: repo.owner.avatar_url,
  createdAt: new Date(repo.created_at),
});
