import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { config } from '../config';
import { catchAsync } from '../utils/controllerHandler';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';
import {
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/auth';
import { createUnauthorizedError } from '../utils/AppError';

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

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const { email, password, name } = req.body as RegisterInput;

    const result = await authService.registerUser({
      email,
      password,
      name,
    });

    if (result.success && result.token) {
      res.cookie('jwt', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: getMaxAgeFromJwtExpiration(config.jwtExpiresIn),
      });

      if (result.refreshToken) {
        res.cookie('refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: getMaxAgeFromJwtExpiration(config.jwtRefreshExpiresIn),
        });
      }
    }

    const statusCode = result.success ? 201 : 400;
    const responseData = { ...result };
    delete responseData.token;
    delete responseData.refreshToken;

    res.status(statusCode).json(responseData);
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;

    const result = await authService.loginUser({ email, password });

    if (result.success && result.token) {
      res.cookie('jwt', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: getMaxAgeFromJwtExpiration(config.jwtExpiresIn),
      });

      if (result.refreshToken) {
        res.cookie('refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: getMaxAgeFromJwtExpiration(config.jwtRefreshExpiresIn),
        });
      }
    }

    const statusCode = result.success ? 200 : 400;
    const responseData = { ...result };
    delete responseData.token;
    delete responseData.refreshToken;

    res.status(statusCode).json(responseData);
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    // Clear both the access token and refresh token cookies
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  refreshToken: catchAsync(async (req: Request, res: Response) => {
    // Get refresh token from cookie or request body
    const refreshToken =
      req.cookies.refresh_token ||
      (req.body as RefreshTokenRequest).refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      } as RefreshTokenResponse);
    }

    const tokens = await authService.refreshTokens(refreshToken);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      } as RefreshTokenResponse);
    }

    // Set new cookies
    res.cookie('jwt', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: getMaxAgeFromJwtExpiration(config.jwtExpiresIn),
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: getMaxAgeFromJwtExpiration(config.jwtRefreshExpiresIn),
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
    } as RefreshTokenResponse);
  }),

  getProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw createUnauthorizedError('User ID not found in request');
    }

    const user = await authService.getUserById(userId);

    res.json({
      success: true,
      user,
    } as AuthResponse);
  }),
};
