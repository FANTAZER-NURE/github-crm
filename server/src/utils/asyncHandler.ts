import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to automatically catch errors and forward them to Express error handlers
 *
 * @param fn The async route handler function
 * @returns A middleware that will catch any errors and pass them to next()
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
