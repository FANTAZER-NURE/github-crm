import { validateEnv } from './utils/envValidator';
import logger from './utils/logger';

// Validate environment variables
const { env, success, errors } = validateEnv();

// If validation fails, log the errors and exit the process
if (!success || !env) {
  logger.error(`Environment validation failed: \n${errors}`);
  process.exit(1);
}

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  clientUrl: string;
  databaseUrl: string;
  githubAccessToken?: string;
}

export const config: Config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  jwtSecret: env.JWT_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  clientUrl: env.CLIENT_URL,
  databaseUrl: env.DATABASE_URL,
  githubAccessToken: env.GITHUB_ACCESS_TOKEN,
};
