export const mapGitHubRepo = (repo: any) => ({
  id: repo.id,
  name: repo.name,
  description: repo.description || '',
  url: repo.html_url,
  stars: repo.stargazers_count,
  forks: repo.forks_count,
  issues: repo.open_issues_count,
  owner: {
    login: repo.owner.login,
    avatar_url: repo.owner.avatar_url,
  },
  createdAt: repo.created_at,
});
