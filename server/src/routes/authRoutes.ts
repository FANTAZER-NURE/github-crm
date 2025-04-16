import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation/validationMiddleware';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from '../schemas/authSchemas';
import { authRateLimiter } from '../middleware/security/rateLimitMiddleware';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);
router.post('/logout', authController.logout);
router.post(
  '/refresh-token',
  authRateLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
