import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth/authMiddleware';
import { validate } from '../middleware/validation/validationMiddleware';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import { authRateLimiter } from '../middleware/security/rateLimitMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public routes
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res))
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);

router.get(
  '/logout',
  authMiddleware,
  asyncHandler((req, res) => authController.logout(req, res))
);

router.get(
  '/refresh-token',
  authRateLimiter,
  authMiddleware,
  asyncHandler((req, res) => authController.refreshToken(req, res))
);

// Protected routes
router.get(
  '/profile',
  authMiddleware,
  asyncHandler((req, res) => authController.getProfile(req, res))
);

export default router;
