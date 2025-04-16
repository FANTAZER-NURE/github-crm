import { Router, Request, Response } from 'express';
import { githubController } from '../controllers/githubController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public route (doesn't require authentication)
router.get('/search', async (req: Request, res: Response) => {
  await githubController.searchGlobalRepositories(req, res);
});

// Protected routes (require authentication)
router.use(authenticate);

// Add a new repository (POST /api/github/repositories)
router.post('/repositories', async (req: Request, res: Response) => {
  await githubController.addRepository(req, res);
});

// List all repositories (GET /api/github/repositories)
router.get('/repositories', async (req: Request, res: Response) => {
  await githubController.listRepositories(req, res);
});

// Update repository data (PUT /api/github/repositories/:id)
router.put('/repositories/:id', async (req: Request, res: Response) => {
  await githubController.updateRepository(req, res);
});

// Delete a repository (DELETE /api/github/repositories/:id)
router.delete('/repositories/:id', async (req: Request, res: Response) => {
  await githubController.deleteRepository(req, res);
});

export default router;
