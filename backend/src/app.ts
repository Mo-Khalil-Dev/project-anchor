import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { globalErrorHandler } from './features/shared/middleware/globalErrorHandler';
import { createBankConnectionRoutes } from './presentation/routes/bankConnection.routes';
import { createAssessmentRoutes } from './presentation/routes/assessment.routes';
import { createCustomerRoutes } from './presentation/routes/customer.routes';
import { createAuthRouter } from './features/auth/router';
import { initAuthProvider } from './features/shared/config/providers/auth-provider.factory';
import type { AppConfig } from './features/shared/config';
import type { ILogger } from './features/shared/logging';

export function createApp(config: AppConfig, logger: ILogger, prisma: PrismaClient): Express {
  const app: Express = express();

  // ============ MIDDLEWARE ============

  app.use(helmet());

  // Manual CORS middleware - the cors package wasn't setting credentials header
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Trace-ID');
      res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  });

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

  // ============ AUTH SETUP ============
  const authProvider = initAuthProvider(config);
  const authSetup = createAuthRouter(authProvider, prisma);
  const authMiddleware = authSetup.authenticateRequest;

  // ============ FEATURE ROUTES ============
  app.use('/api', authSetup.router);
  app.use('/api/bank-connections', createBankConnectionRoutes(config, logger, authMiddleware));
  app.use('/api', createAssessmentRoutes());
  app.use('/api/customer', createCustomerRoutes(logger, authMiddleware));

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
