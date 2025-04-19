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

    console.log('HERE1', token);

    if (!token) {
      console.log('HERE2');
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        console.log('HERE4');
        return next(createUnauthorizedError('Authentication required'));
      }

      // Format: "Bearer [token]"
      token = authHeader.split(' ')[1];
      console.log('HERE3', token);
    }

    if (!token) {
      return next(createUnauthorizedError('Token missing'));
    }

    // token exists
    console.log('--token----', token);

    const revokedToken = await tokenRepository.findRevokedToken(token);
    console.log('HERE5', revokedToken);
    if (revokedToken) {
      console.log('--revokedToken----', revokedToken);
      return next(createUnauthorizedError('Token expired or invalid'));
    }

    // token is not expired

    const decoded = jwt.verify(token, config.jwtSecret as Secret) as {
      id: number;
    };

    console.log('decoded', decoded);

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return next(createUnauthorizedError('User not found'));
    }
    console.log('user.accessToken1', user);
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken: null,
      refreshToken: null,
    };

    console.log('user.accessToken2', user);

    // token is not expired

    if (user.accessToken === token && req.url !== '/refresh-token') {
      // token access
      return next(createUnauthorizedError('Token expired or invalid'));
    }

    // token is refresh

    next();
  } catch (error) {
    return next(error);
  }
};

// Export an alias for cleaner import names
export const authenticate = authMiddleware;
