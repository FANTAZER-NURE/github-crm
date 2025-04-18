import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';
import {
  createBadRequestError,
  createUnauthorizedError,
} from '../utils/AppError';
import { splitToken } from '../utils/splitToken';

export class AuthController {
  public async register(req: Request, res: Response) {
    const { email, password, name } = req.body as RegisterInput;

    const result = await authService.registerUser({
      email,
      password,
      name,
    });

    res.status(result.status).json(result);
  }

  public async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginInput;

    const result = await authService.loginUser({ email, password });

    res.status(result.status).json(result);
  }

  public async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return createUnauthorizedError('Auth token is required');
    }
    const token = splitToken(authHeader);

    if (!token) {
      return createUnauthorizedError('Auth token is required');
    }

    const result = await authService.logoutUser(token);

    res.status(result.status).json(result);
  }

  public async refreshToken(req: Request, res: Response) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return createUnauthorizedError('Auth token is required');
    }
    const token = splitToken(authHeader);

    if (!token) {
      return createUnauthorizedError('Auth token is required');
    }

    const result = await authService.refreshToken(token);

    if (!result.success) {
      return createUnauthorizedError('Failed to refresh token');
    }

    res.status(result.status).json(result);
  }

  public async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return createBadRequestError('User ID not found in request');
    }

    const result = await authService.getUserById(userId);

    res.status(result.status).json(result);
  }
}

export const authController = new AuthController();
