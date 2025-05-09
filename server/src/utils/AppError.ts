/**
 * Custom application error class with status code and operational flag.
 * Operational errors represent problems that we expect and can handle gracefully.
 */
export class AppError extends Error {
  status: number;
  isOperational: boolean;
  success: boolean;
  path?: string;
  value?: any;
  code?: string;
  errorMessage?: string;

  constructor(
    message: string,
    status: number = 500,
    isOperational: boolean = true,
    success: boolean = false
  ) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    this.success = success;
    this.message = message;
    this.errorMessage = message;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a 400 Bad Request error
 */
export const createBadRequestError = (
  message: string,
  value?: any,
  success?: boolean
): AppError => {
  const error = new AppError(message, 400, success);
  if (value) error.value = value;
  return error;
};

/**
 * Create a 401 Unauthorized error
 */
export const createUnauthorizedError = (
  message: string = 'Unauthorized'
): AppError => {
  return new AppError(message, 401);
};

/**
 * Create a 403 Forbidden error
 */
export const createForbiddenError = (
  message: string = 'Forbidden'
): AppError => {
  return new AppError(message, 403);
};

/**
 * Create a 404 Not Found error
 */
export const createNotFoundError = (
  message: string,
  path?: string
): AppError => {
  const error = new AppError(message, 404);
  if (path) error.path = path;
  return error;
};

/**
 * Create a 409 Conflict error
 */
export const createConflictError = (message: string, value?: any): AppError => {
  const error = new AppError(message, 409);
  if (value) error.value = value;
  return error;
};

/**
 * Create a 500 Internal Server Error
 */
export const createInternalServerError = (
  message: string = 'Internal Server Error'
): AppError => {
  return new AppError(message, 500, false);
};
