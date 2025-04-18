import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { createBadRequestError } from '../../utils/AppError';
import logger from '../../utils/logger';

/**
 * Validates request body, query, or params against a Zod schema
 *
 * @param schema The Zod schema to validate against
 * @param source The part of the request to validate (body, query, params)
 * @returns Middleware function
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[source]);

      req[source] = data;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.debug('Validation error', { errors: error.errors });

        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = formattedErrors
          .map((err) => `${err.path}: ${err.message}`)
          .join(', ');

        next(createBadRequestError(errorMessage, formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
