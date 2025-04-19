import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { config } from '../config/index';
import { createUnauthorizedError } from '../utils/AppError';
import logger from '../utils/logger';
import { UserRepository } from '../data-layer/userRepository';
import { User } from '../generated/prisma';
import { AUTH_TOKEN_NAME } from '../utils/constants';
import { TokenRepository } from '../data-layer/tokenRepository';

const userRepository = new UserRepository();
const tokenRepository = new TokenRepository();

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password' | 'createdAt'>;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies[AUTH_TOKEN_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next(createUnauthorizedError('Authentication required'));
      }

      // Format: "Bearer [token]"
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(createUnauthorizedError('Token missing'));
    }

    // if token in revoked table, return 401
    const revokedToken = await tokenRepository.findRevokedToken(token);
    if (revokedToken) {
      return next(createUnauthorizedError('Token expired or invalid'));
    }

    const decoded = jwt.verify(token, config.jwtSecret as Secret) as {
      id: number;
    };

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return next(createUnauthorizedError('User not found'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken: null,
      refreshToken: null,
    };

    if (user.accessToken === token && req.url !== '/refresh-token') {
      return next(createUnauthorizedError('Token expired or invalid'));
    }

    next();
  } catch (error) {
    return next(error);
  }
};

// Export an alias for cleaner import names
export const authenticate = authMiddleware;
