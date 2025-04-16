import { Request, Response, NextFunction } from 'express';
import logger from './logger';

/**
 * Controller handler to wrap async controller functions for consistent error handling
 *
 * @param fn The async controller function
 * @returns A middleware that executes the controller and catches any errors
 */
export const catchAsync = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: Error) => {
      logger.error(`Controller error: ${err.message}`, err);
      next(err);
    });
  };
};
