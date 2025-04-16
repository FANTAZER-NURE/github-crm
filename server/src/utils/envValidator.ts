import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define the schema for environment variables
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default('3000'),

  // Database
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),

  // JWT configuration
  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET is required' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1, { message: 'JWT_REFRESH_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Client URL for CORS
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // GitHub API (optional)
  GITHUB_ACCESS_TOKEN: z.string().optional(),
});

// Validate and return the environment variables
export const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    return { env, success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      return {
        env: null,
        success: false,
        errors: errorMessages,
      };
    }
    return {
      env: null,
      success: false,
      errors: 'Unknown validation error',
    };
  }
};

// Type for the validated environment
export type ValidatedEnv = ReturnType<typeof validateEnv> & {
  env: z.infer<typeof envSchema>;
};
