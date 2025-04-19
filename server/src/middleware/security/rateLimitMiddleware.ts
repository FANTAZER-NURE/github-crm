import rateLimit from 'express-rate-limit';
import { AppError } from '../../utils/AppError';

/**
 * Creates a rate limiter for authentication routes
 * Helps prevent brute force attacks by limiting the number of requests from a single IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res, next, _options) => {
    next(
      new AppError(
        'Too many requests from this IP, please try again later.',
        429
      )
    );
  },
});

/**
 * Creates a less strict rate limiter for regular API routes
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next, _options) => {
    next(
      new AppError(
        'Too many requests from this IP, please try again later.',
        429
      )
    );
  },
});
