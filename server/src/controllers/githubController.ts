import { Request, Response } from 'express';
import { githubService } from '../services/githubService';
import { AddGithubRepoData, UpdateGithubRepoData } from '../types/github';
import {
  createUnauthorizedError,
  createBadRequestError,
  createInternalServerError,
} from '../utils/AppError';

export class GithubController {
  async addRepository(req: Request, res: Response) {
    const data: AddGithubRepoData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return createUnauthorizedError('User ID not found in request');
    }

    const result = await githubService.addRepository(userId, data);
    res.status(result.status).json(result);
  }

  async listRepositories(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return createUnauthorizedError('User ID not found in request');
    }

    const repositories = await githubService.listRepositories(userId);
    res.json(repositories);
  }

  async refreshRepository(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateGithubRepoData = { id: parseInt(id), ...req.body };
    const userId = req.user?.id;

    if (!userId) {
      return createUnauthorizedError('User ID not found in request');
    }

    // First try to update an existing repository in our database
    const repositoryFromDB = await githubService.refreshRepository(
      userId,
      data
    );

    if (repositoryFromDB.success) {
      return res.status(repositoryFromDB.status).json(repositoryFromDB);
    }

    // If the error is "Repository not found", try to get it directly from GitHub
    // This allows refreshing repositories that aren't saved in our database
    if (repositoryFromDB.status === 404) {
      const githubId = parseInt(id);
      if (isNaN(githubId)) {
        return createBadRequestError('Invalid repository ID');
      }

      // Fetch directly from GitHub API
      const refreshedRepo = await githubService.refreshRepositoryFromGitHub(
        githubId
      );
      return res.status(refreshedRepo.status).json(refreshedRepo);
    }

    return createInternalServerError(
      repositoryFromDB.message || 'Failed to refresh repository'
    );
  }

  async deleteRepository(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return createUnauthorizedError('User ID not found in request');
    }

    const result = await githubService.deleteRepository(userId, parseInt(id));

    if (!result.success) {
      return createBadRequestError(
        result.message || 'Failed to delete repository'
      );
    }

    res.status(result.status).json(result);
  }

  async searchGlobalRepositories(req: Request, res: Response) {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return createBadRequestError('Search query is required');
    }

    const response = await githubService.searchGlobalRepositories(query);

    const repositories = response.repositories;

    return res.status(response.status).json({
      success: response.success,
      repositories,
      message: response.message,
    });
  }
}

export const githubController = new GithubController();
