import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async route handlers to avoid try/catch in each controller
 *
 * @param fn - The async route handler function
 * @returns A function that catches any errors and passes them to next()
 */
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
