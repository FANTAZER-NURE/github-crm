import { Request, Response } from 'express';
import { githubService } from '../services/githubService';
import { AddGithubRepoData, UpdateGithubRepoData } from '../types/github';
import axios from 'axios';
import { mapGitHubRepo } from '../utils/mapGithubRepo';
import {
  createUnauthorizedError,
  createBadRequestError,
  createNotFoundError,
  createForbiddenError,
} from '../utils/AppError';

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

export class GithubController {
  async addRepository(req: Request, res: Response) {
    const data: AddGithubRepoData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw createUnauthorizedError('User ID not found in request');
    }

    const result = await githubService.addRepository(userId, data);
    res.status(201).json(result);
  }

  async listRepositories(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw createUnauthorizedError('User ID not found in request');
    }

    const repositories = await githubService.listRepositories(userId);
    res.json(repositories);
  }

  async updateRepository(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateGithubRepoData = { id: parseInt(id), ...req.body };
    const userId = req.user?.id;

    if (!userId) {
      throw createUnauthorizedError('User ID not found in request');
    }

    if (data.refresh === true) {
      // First try to update an existing repository in our database
      const repository = await githubService.updateRepository(userId, data);

      if (repository.success) {
        return res.json(repository);
      }

      // If the error is "Repository not found", try to get it directly from GitHub
      // This allows refreshing repositories that aren't saved in our database
      if (repository.message && repository.message.includes('not found')) {
        const githubId = parseInt(id);
        if (isNaN(githubId)) {
          throw createBadRequestError('Invalid repository ID');
        }

        // Fetch directly from GitHub API
        const refreshedRepo = await githubService.refreshRepositoryFromGitHub(
          githubId
        );
        return res.json(refreshedRepo);
      }

      throw createBadRequestError(
        repository.message || 'Failed to refresh repository'
      );
    }

    const repository = await githubService.updateRepository(userId, data);
    res.json(repository);
  }

  async deleteRepository(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createUnauthorizedError('User ID not found in request');
    }

    const result = await githubService.deleteRepository(userId, parseInt(id));

    if (!result.success) {
      if (result.message && result.message.includes('not found')) {
        throw createNotFoundError(result.message);
      } else if (result.message && result.message.includes('Unauthorized')) {
        throw createForbiddenError(result.message);
      }
      throw createBadRequestError(
        result.message || 'Failed to delete repository'
      );
    }

    res.json(result);
  }

  async searchGlobalRepositories(req: Request, res: Response) {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      throw createBadRequestError('Search query is required');
    }

    const response = await githubService.searchGlobalRepositories(query);

    const repositories = response.items?.map(mapGitHubRepo);

    return res.json({
      success: response.success,
      repositories,
      message: response.message,
    });
  }
}

export const githubController = new GithubController();
