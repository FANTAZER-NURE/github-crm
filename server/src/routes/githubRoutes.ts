import { Router } from 'express';
import { githubController } from '../controllers/githubController';
import { authenticate } from '../middleware/auth/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public route (doesn't require authentication)
router.get(
  '/search',
  asyncHandler((req, res) =>
    githubController.searchGlobalRepositories(req, res)
  )
);

// Protected routes (require authentication)
router.use(authenticate);

// Add a new repository (POST /api/github/repositories)
router.post(
  '/repositories',
  asyncHandler((req, res) => githubController.addRepository(req, res))
);

// List all repositories (GET /api/github/repositories)
router.get(
  '/repositories',
  asyncHandler((req, res) => githubController.listRepositories(req, res))
);

// Update repository data (PUT /api/github/repositories/:id)
router.get(
  '/repositories/refresh/:id',
  asyncHandler((req, res) => githubController.refreshRepository(req, res))
);

// Delete a repository (DELETE /api/github/repositories/:id)
router.delete(
  '/repositories/:id',
  asyncHandler((req, res) => githubController.deleteRepository(req, res))
);

export default router;
