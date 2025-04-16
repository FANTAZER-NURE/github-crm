import axios from 'axios';
import {
  GithubRepoData,
  AddGithubRepoData,
  GithubRepoResponse,
  GithubReposResponse,
  UpdateGithubRepoData,
} from '../types/github';
import { GithubProjectRepository } from '../data-layer/githubProjectRepository';
import { dateToUnixTimestamp } from '../utils/dateUtils';

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

export class GithubService {
  private githubProjectRepository: GithubProjectRepository;

  constructor(githubProjectRepository?: GithubProjectRepository) {
    this.githubProjectRepository =
      githubProjectRepository || new GithubProjectRepository();
  }

  async fetchRepositoryInfo(owner: string, repo: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Repository not found');
      }
      console.error('Error fetching repository info:', error);
      throw new Error('Failed to fetch repository information from GitHub');
    }
  }

  // New method to fetch repository directly from GitHub by ID
  async fetchRepositoryById(repoId: number): Promise<any> {
    try {
      const response = await axios.get(
        `${GITHUB_API_URL}/repositories/${repoId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Repository not found');
      }
      console.error('Error fetching repository by ID:', error);
      throw new Error('Failed to fetch repository information from GitHub');
    }
  }

  // New method to refresh a repository directly from GitHub without requiring a DB entry
  async refreshRepositoryFromGitHub(
    repoId: number
  ): Promise<GithubRepoResponse> {
    try {
      // Fetch the repository data directly from GitHub
      const repoInfo = await this.fetchRepositoryById(repoId);

      return {
        success: true,
        message: 'Repository refreshed from GitHub',
        repository: {
          id: repoInfo.id,
          owner: {
            login: repoInfo.owner.login,
            avatar_url: repoInfo.owner.avatar_url,
          },
          name: repoInfo.name,
          description: repoInfo.description || '',
          url: repoInfo.html_url,
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          issues: repoInfo.open_issues_count,
          createdAt: repoInfo.created_at,
        },
      };
    } catch (error) {
      console.error('Error refreshing repository from GitHub:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to refresh repository from GitHub';
      return {
        success: false,
        message,
      };
    }
  }

  async addRepository(
    userId: number,
    repoData: AddGithubRepoData
  ): Promise<GithubRepoResponse> {
    try {
      let owner, name, repoInfo;

      // If repoPath is provided, extract owner/name and fetch from GitHub API
      if (repoData.repoPath) {
        const [pathOwner, pathName] = repoData.repoPath.split('/');
        if (!pathOwner || !pathName) {
          return {
            success: false,
            message: 'Invalid repository path. Please use format "owner/name"',
          };
        }

        owner = pathOwner;
        name = pathName;

        const existingRepo =
          await this.githubProjectRepository.findByUserAndRepo(
            userId,
            owner,
            name
          );

        if (existingRepo) {
          return {
            success: false,
            message: 'This repository is already in your list',
          };
        }

        repoInfo = await this.fetchRepositoryInfo(owner, name);
      } else {
        owner = repoData.owner.login;
        name = repoData.name;

        const existingRepo =
          await this.githubProjectRepository.findByUserAndRepo(
            userId,
            owner,
            name
          );

        if (existingRepo) {
          return {
            success: false,
            message: 'This repository is already in your list',
          };
        }

        repoInfo = {
          id: repoData.id,
          name: repoData.name,
          description: repoData.description,
          html_url: repoData.url,
          stargazers_count: repoData.stars,
          forks_count: repoData.forks,
          open_issues_count: repoData.issues,
          owner: {
            login: repoData.owner.login,
            avatar_url: repoData.owner.avatar_url,
          },
          created_at: repoData.createdAt,
        };
      }

      const createdAt =
        typeof repoInfo.created_at === 'string'
          ? new Date(repoInfo.created_at)
          : new Date();

      const repository = await this.githubProjectRepository.create({
        userId,
        owner: repoInfo.owner.login,
        name: repoInfo.name,
        description: repoInfo.description || '',
        url: repoInfo.html_url,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        issues: repoInfo.open_issues_count,
        ownerAvatarUrl: repoInfo.owner.avatar_url,
        createdAt,
      });

      return {
        success: true,
        message: 'Repository added successfully',
        repository: {
          id: repository.id,
          owner: {
            login: repository.owner,
            avatar_url: repository.ownerAvatarUrl || '',
          },
          name: repository.name,
          description: repository.description,
          url: repository.url,
          stars: repository.stars,
          forks: repository.forks,
          issues: repository.issues,
          createdAt: dateToUnixTimestamp(repository.createdAt).toString(),
        },
      };
    } catch (error) {
      console.error('Error adding repository:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to add repository';
      return {
        success: false,
        message,
      };
    }
  }

  async listRepositories(userId: number): Promise<GithubReposResponse> {
    try {
      const repositories = await this.githubProjectRepository.getAllByUser(
        userId
      );

      return {
        success: true,
        repositories: repositories.map((repo) => ({
          id: repo.id,
          owner: {
            login: repo.owner,
            avatar_url: repo.ownerAvatarUrl || '',
          },
          name: repo.name,
          description: repo.description || '',
          url: repo.url,
          stars: repo.stars,
          forks: repo.forks,
          issues: repo.issues,
          createdAt: dateToUnixTimestamp(repo.createdAt).toString(),
        })),
      };
    } catch (error) {
      console.error('Error listing repositories:', error);
      return {
        success: false,
        message: 'Failed to list repositories',
      };
    }
  }

  async updateRepository(
    userId: number,
    { id }: UpdateGithubRepoData
  ): Promise<GithubRepoResponse> {
    try {
      const repository = await this.githubProjectRepository.findById(id);

      if (!repository) {
        return {
          success: false,
          message: 'Repository not found',
        };
      }

      if (repository.userId !== userId) {
        return {
          success: false,
          message: 'Unauthorized: You do not own this repository',
        };
      }

      const repoInfo = await this.fetchRepositoryInfo(
        repository.owner,
        repository.name
      );

      const updatedRepo = await this.githubProjectRepository.update(id, {
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        issues: repoInfo.open_issues_count,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: 'Repository updated successfully',
        repository: {
          id: updatedRepo.id,
          owner: {
            login: updatedRepo.owner,
            avatar_url: updatedRepo.ownerAvatarUrl || '',
          },
          name: updatedRepo.name,
          description: updatedRepo.description || '',
          url: updatedRepo.url,
          stars: updatedRepo.stars,
          forks: updatedRepo.forks,
          issues: updatedRepo.issues,
          createdAt: dateToUnixTimestamp(updatedRepo.createdAt).toString(),
        },
      };
    } catch (error) {
      console.error('Error updating repository:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update repository';
      return {
        success: false,
        message,
      };
    }
  }

  async deleteRepository(
    userId: number,
    id: number
  ): Promise<GithubRepoResponse> {
    try {
      const repository = await this.githubProjectRepository.findById(id);

      if (!repository) {
        return {
          success: false,
          message: `Repository with ID ${id} not found in database`,
        };
      }

      if (repository.userId !== userId) {
        return {
          success: false,
          message: 'Unauthorized: You do not own this repository',
        };
      }

      await this.githubProjectRepository.delete(id);

      return {
        success: true,
        message: 'Repository deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting repository:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `Failed to delete repository: ${error.message}`
            : 'Failed to delete repository due to an unknown error',
      };
    }
  }
}

export const githubService = new GithubService();
