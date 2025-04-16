import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { config } from '../config/index';
import { createUnauthorizedError } from '../utils/appError';
import logger from '../utils/logger';
import { UserRepository } from '../data-layer/userRepository';
import { User } from '../generated/prisma';

const userRepository = new UserRepository();

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
    let token = req.cookies?.jwt;

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

    try {
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
      };

      next();
    } catch (error) {
      logger.error('JWT verification error:', error);
      return next(createUnauthorizedError('Invalid or expired token'));
    }
  } catch (error) {
    return next(error);
  }
};

// Export an alias for cleaner import names
export const authenticate = authMiddleware;
