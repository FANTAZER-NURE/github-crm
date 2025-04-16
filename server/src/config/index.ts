import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtExpire: string;
  clientUrl: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
