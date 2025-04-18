import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtExpire: string;
  clientUrl: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'your-default-refresh-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
