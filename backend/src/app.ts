import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';
import { createAssessmentRoutes } from './presentation/routes/assessment.routes';

const app: Express = express();

// ============ MIDDLEWARE ============

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.id,
    });
  });

  next();
});

// ============ ROUTES ============

// Health check (for ALB)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/assessments', createAssessmentRoutes());
// app.use('/payment-plans', require('./routes/payment-plans'));
// app.use('/admin/cases', require('./routes/cases'));
// app.use('/auth', require('./routes/auth'));

// ============ ERROR HANDLING ============

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      traceId: Math.random().toString(36).substring(7),
    },
  });
});

export default app;
