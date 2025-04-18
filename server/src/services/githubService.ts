import axios, { AxiosError } from 'axios';
import {
  AddGithubRepoData,
  GithubApiRepositoriesResponse,
  GithubRepoData,
  GithubRepoResponse,
  GithubReposResponse,
  UpdateGithubRepoData,
} from '../types/github';
import { GithubProjectRepository } from '../data-layer/githubProjectRepository';
import {
  AppError,
  createBadRequestError,
  createForbiddenError,
  createInternalServerError,
  createNotFoundError,
} from '../utils/AppError';
import { mapGitHubRepo } from '../utils/mapGithubRepo';

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

const AxiosGHInstance = axios.create({
  baseURL: GITHUB_API_URL,
});

export class GithubService {
  private githubProjectRepository: GithubProjectRepository;

  constructor(githubProjectRepository?: GithubProjectRepository) {
    this.githubProjectRepository =
      githubProjectRepository || new GithubProjectRepository();
  }

  private async fetchRepositoryInfo(
    owner: string,
    repo: string
  ): Promise<GithubRepoData> {
    try {
      const response = await AxiosGHInstance.get(`/repos/${owner}/${repo}`);
      return mapGitHubRepo(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw createNotFoundError('Repository not found');
      }
      throw createInternalServerError(
        'Failed to fetch repository information from GitHub'
      );
    }
  }

  private async fetchRepositoryById(
    repoId: number
  ): Promise<GithubApiRepositoriesResponse> {
    try {
      const response = await AxiosGHInstance.get(`/repositories/${repoId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Repository not found');
      }
      console.error('Error fetching repository by ID:', error);
      throw new Error('Failed to fetch repository information from GitHub');
    }
  }

  async refreshRepositoryFromGitHub(
    repoId: number
  ): Promise<GithubRepoResponse> {
    try {
      const repoInfo = await this.fetchRepositoryById(repoId);

      return {
        success: true,
        message: 'Repository refreshed from GitHub',
        status: 200,
        repository: mapGitHubRepo(repoInfo),
      };
    } catch (error) {
      return createInternalServerError(
        error instanceof AxiosError
          ? error.response?.data.message
          : 'Failed to refresh repository from GitHub'
      );
    }
  }

  private async extractRepositoryData(
    userId: number,
    repoData: AddGithubRepoData
  ): Promise<GithubRepoData | AppError> {
    let repoInfo: GithubRepoData;
    if (repoData.repoPath) {
      const [pathOwner, pathName] = repoData.repoPath.split('/');
      if (!pathOwner || !pathName) {
        return createBadRequestError(
          'Invalid repository path. Please use format "owner/name"'
        );
      }

      const owner = pathOwner;
      const name = pathName;

      const existingRepo = await this.githubProjectRepository.findByUserAndRepo(
        userId,
        owner,
        name
      );

      if (existingRepo) {
        return createBadRequestError(
          'This repository is already in your list',
          existingRepo
        );
      }

      repoInfo = await this.fetchRepositoryInfo(owner, name);
    } else {
      const owner = repoData.owner;
      const name = repoData.name;

      const existingRepo = await this.githubProjectRepository.findByUserAndRepo(
        userId,
        owner,
        name
      );

      if (existingRepo) {
        return createBadRequestError('This repository is already in your list');
      }

      repoInfo = {
        id: repoData.id,
        name: repoData.name,
        description: repoData.description,
        url: repoData.url,
        stars: repoData.stars,
        forks: repoData.forks,
        issues: repoData.issues,
        owner: repoData.owner,
        ownerAvatarUrl: repoData.ownerAvatarUrl,
        createdAt: new Date(repoData.createdAt),
      };
    }

    return repoInfo;
  }

  async addRepository(
    userId: number,
    repoData: AddGithubRepoData
  ): Promise<GithubRepoResponse> {
    try {
      const repoInfo = await this.extractRepositoryData(userId, repoData);

      if (repoInfo instanceof AppError) {
        return repoInfo;
      }

      const repository = await this.githubProjectRepository.create({
        userId,
        owner: repoInfo.owner,
        name: repoInfo.name,
        description: repoInfo.description || '',
        url: repoInfo.url,
        stars: repoInfo.stars,
        forks: repoInfo.forks,
        issues: repoInfo.issues,
        ownerAvatarUrl: repoInfo.ownerAvatarUrl,
        createdAt: repoInfo.createdAt,
      });

      return {
        success: true,
        message: 'Repository added successfully',
        repository,
        status: 201,
      };
    } catch (error) {
      return createInternalServerError(
        error instanceof AxiosError
          ? error.response?.data.message
          : 'Failed to add repository'
      );
    }
  }

  async listRepositories(userId: number): Promise<GithubReposResponse> {
    try {
      const repositories = await this.githubProjectRepository.getAllByUser(
        userId
      );

      return {
        success: true,
        repositories,
        status: 200,
        message: 'Repositories fetched successfully',
      };
    } catch (error) {
      return createInternalServerError('Failed to list repositories');
    }
  }

  async refreshRepository(
    userId: number,
    { id }: UpdateGithubRepoData
  ): Promise<GithubRepoResponse> {
    try {
      const repository = await this.githubProjectRepository.findById(id);

      if (!repository) {
        return createNotFoundError('Repository not found');
      }

      if (repository.userId !== userId) {
        return createForbiddenError(
          'Unauthorized: You do not own this repository'
        );
      }

      const repoInfo = await this.fetchRepositoryInfo(
        repository.owner,
        repository.name
      );

      const updatedRepo = await this.githubProjectRepository.update(id, {
        stars: repoInfo.stars,
        forks: repoInfo.forks,
        issues: repoInfo.issues,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: 'Repository updated successfully',
        status: 200,
        repository: updatedRepo,
      };
    } catch (error) {
      return createInternalServerError(
        error instanceof AxiosError
          ? error.response?.data.message
          : 'Failed to update repository'
      );
    }
  }

  async deleteRepository(
    userId: number,
    id: number
  ): Promise<GithubRepoResponse> {
    try {
      const repository = await this.githubProjectRepository.findById(id);

      if (!repository) {
        return createNotFoundError(
          `Repository with ID ${id} not found in database`
        );
      }

      if (repository.userId !== userId) {
        return createForbiddenError(
          'Unauthorized: You do not own this repository'
        );
      }

      const deletedRepo = await this.githubProjectRepository.delete(id);

      return {
        success: true,
        message: 'Repository deleted successfully',
        status: 200,
        repository: deletedRepo,
      };
    } catch (error) {
      return createInternalServerError('Failed to delete repository');
    }
  }

  async searchGlobalRepositories(query: string): Promise<GithubReposResponse> {
    try {
      if (query.length < 3) {
        return {
          success: true,
          repositories: [],
          status: 200,
          message: 'GitHub API requires at least 3 characters for search',
        };
      }
      const response = await AxiosGHInstance.get(`/search/repositories`, {
        params: { q: query },
      });
      return {
        success: true,
        repositories: response.data.items.map(mapGitHubRepo),
        status: 200,
        message: 'Repositories fetched successfully',
      };
    } catch (error) {
      console.error('Error searching global repositories:', error);
      return createInternalServerError('Failed to search global repositories');
    }
  }
}

export const githubService = new GithubService();
