import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { config } from '../config';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';
import {
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/auth';
import { createUnauthorizedError } from '../utils/AppError';
import { AUTH_TOKEN_NAME } from '../utils/constants';

// Helper function to convert JWT expiration string to milliseconds
const getMaxAgeFromJwtExpiration = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default to 1 day

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000; // seconds to ms
    case 'm':
      return value * 60 * 1000; // minutes to ms
    case 'h':
      return value * 60 * 60 * 1000; // hours to ms
    case 'd':
      return value * 24 * 60 * 60 * 1000; // days to ms
    default:
      return 24 * 60 * 60 * 1000; // Default to 1 day
  }
};

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body as RegisterInput;

    const result = await authService.registerUser({
      email,
      password,
      name,
    });

    const statusCode = result.success ? 201 : 400;
    const responseData = { ...result };
    delete responseData.token;
    delete responseData.refreshToken;

    res.status(statusCode).json(responseData);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginInput;

    const result = await authService.loginUser({ email, password });

    const statusCode = result.success ? 200 : 400;
    const responseData = { ...result };

    console.log('responseData', responseData);
    console.log('result', result);

    res.status(statusCode).json(responseData);
  }

  async logout(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Auth token is required',
      } as RefreshTokenResponse);
    }
  }

  async refreshToken(req: Request, res: Response) {
    // Get refresh token from cookie or request body
    const authToken = req.headers.authorization?.split(' ')[1];

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'Auth token is required',
      } as RefreshTokenResponse);
    }

    const token = await authService.refreshToken(authToken);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      } as RefreshTokenResponse);
    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token,
    } as RefreshTokenResponse);
  }

  async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw createUnauthorizedError('User ID not found in request');
    }

    const user = await authService.getUserById(userId);

    res.json({
      success: true,
      user,
    } as AuthResponse);
  }
}

export const authController = new AuthController();
