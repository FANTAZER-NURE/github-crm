import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import githubRoutes from './routes/githubRoutes';
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/error/errorMiddleware';
import { apiRateLimiter } from './middleware/security/rateLimitMiddleware';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: config.clientUrl || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use(notFoundHandler);

app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Allowing CORS for: ${corsOptions.origin}`);
});
