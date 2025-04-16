import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ErrorResponse {
  status: string;
  message: string;
  code?: string;
  path?: string;
  stack?: string;
}

/**
 * Handle Prisma-specific errors and convert them to AppErrors
 */
const handlePrismaError = (err: PrismaClientKnownRequestError): AppError => {
  // Handle specific Prisma error codes
  switch (err.code) {
    case 'P2002': // Unique constraint violation
      return new AppError(`Duplicate field value: ${err.meta?.target}`, 409);
    case 'P2025': // Record not found
      return new AppError('Record not found', 404);
    case 'P2003': // Foreign key constraint violation
      return new AppError('Related record not found', 400);
    default:
      logger.error(`Unhandled Prisma error: ${err.code}`, err);
      return new AppError('Database error', 500);
  }
};

/**
 * Handle JWT-specific errors
 */
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT expiration errors
 */
const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Format error for development environment
 */
const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  logger.error(`ERROR 💥`, err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

/**
 * Format error for production environment
 */
const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // Only log non-operational errors (unexpected errors)
  if (!err.isOperational) {
    logger.error('Non-operational error:', err);
  }

  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      status: err.status,
      message: err.message,
    };

    if (err.code) errorResponse.code = err.code;
    if (err.path) errorResponse.path = err.path;

    return res.status(err.statusCode).json(errorResponse);
  }

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: AppError =
    err instanceof AppError
      ? err
      : new AppError(err.message || 'Something went wrong', 500, false);

  if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Middleware for handling 404 Not Found errors for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req.originalUrl || req.url;
  const err = new AppError(
    `Cannot find ${req.method} ${path} on this server`,
    404
  );
  next(err);
};
