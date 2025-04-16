import { Request, Response } from 'express';
import { githubService } from '../services/githubService';
import { AddGithubRepoData, UpdateGithubRepoData } from '../types/github';
import axios from 'axios';
import { mapGitHubRepo } from '../utils/mapGithubRepo';

const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

export class GithubController {
  async addRepository(req: Request, res: Response) {
    try {
      const data: AddGithubRepoData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request',
        });
      }

      const result = await githubService.addRepository(userId, data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add repository',
      });
    }
  }

  async listRepositories(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request',
        });
      }

      const repositories = await githubService.listRepositories(userId);
      res.json(repositories);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to list repositories',
      });
    }
  }

  async updateRepository(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateGithubRepoData = { id: parseInt(id), ...req.body };
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request',
        });
      }

      if (data.refresh === true) {
        try {
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
              return res.status(400).json({
                success: false,
                message: 'Invalid repository ID',
              });
            }

            // Fetch directly from GitHub API
            const refreshedRepo =
              await githubService.refreshRepositoryFromGitHub(githubId);
            return res.json(refreshedRepo);
          }

          return res.status(400).json(repository);
        } catch (error: any) {
          return res.status(400).json({
            success: false,
            message: error.message || 'Failed to refresh repository',
          });
        }
      }

      const repository = await githubService.updateRepository(userId, data);
      res.json(repository);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update repository',
      });
    }
  }

  async deleteRepository(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in request',
        });
      }

      const result = await githubService.deleteRepository(userId, parseInt(id));

      if (!result.success) {
        if (result.message && result.message.includes('not found')) {
          return res.status(404).json(result);
        } else if (result.message && result.message.includes('Unauthorized')) {
          return res.status(403).json(result);
        }
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete repository',
      });
    }
  }

  async searchGlobalRepositories(req: Request, res: Response) {
    try {
      const { search } = req.query;

      if (!search || typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      // GitHub search API requires a minimum of 3 characters
      if (search.length < 3) {
        return res.json({
          success: true,
          repositories: [],
          message: 'GitHub API requires at least 3 characters for search',
        });
      }

      const response = await axios.get(
        `${GITHUB_API_URL}/search/repositories`,
        {
          params: {
            q: search,
            sort: 'stars',
            order: 'desc',
            per_page: 10,
          },
          headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            }),
          },
        }
      );

      const repositories = response.data.items.map(mapGitHubRepo);

      return res.json({
        success: true,
        repositories,
      });
    } catch (error: any) {
      console.error('GitHub API search error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to search GitHub repositories',
      });
    }
  }
}

export const githubController = new GithubController();
