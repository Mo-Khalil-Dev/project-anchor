import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { globalErrorHandler } from './presentation/middleware';
import { createBankConnectionRoutes } from './presentation/routes/bankConnection.routes';
import { createAssessmentRoutes } from './presentation/routes/assessment.routes';
import { initializeAuthDependencies } from './infrastructure/auth/authDependencies';
import type { AppConfig } from './shared/config';
import type { ILogger } from './shared/logging';

export function createApp(config: AppConfig, logger: ILogger, prisma: PrismaClient): Express {
  const app: Express = express();

  // ============ MIDDLEWARE ============

  app.use(helmet());
  // CORS configuration - allow all origins
  app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
    maxAge: 86400,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestLogger = logger.child({ traceId: req.headers['x-trace-id'] as string });

    res.on('finish', () => {
      requestLogger.info('HTTP request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      });
    });

    next();
  });

  // ============ ROUTES ============

  app.get('/health', (_: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // API Routes
  const apiRouter = express.Router();

  // Auth routes
  initializeAuthDependencies(apiRouter, config, prisma);

  // Other routes
  app.use('/api/bank-connections', createBankConnectionRoutes(config, logger));
  app.use('/api', createAssessmentRoutes());
  app.use('/api', apiRouter);

  // ============ ERROR HANDLING ============

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
    });
  });

  app.use(globalErrorHandler(logger, config));

  return app;
}
