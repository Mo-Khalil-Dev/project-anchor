import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/DomainError';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { ValidationError } from '../../shared/errors/ValidationError';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Global error handler middleware
 *
 * Catches ALL unhandled errors and returns a uniform response.
 * Distinguishes between:
 * - Domain errors (business rule violations) → 400 Bad Request
 * - Application errors (repo, service failures) → error.statusCode
 * - Validation errors → 400 Bad Request
 * - Unknown errors → 500 Internal Server Error
 *
 * IMPORTANT: This must be registered LAST in the middleware chain.
 * Place it after all other middleware and routes.
 *
 * Usage in app.ts:
 *   app.use(routes);
 *   app.use(globalErrorHandler());
 */
export function globalErrorHandler() {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const traceId = uuidv4();
    const timestamp = new Date().toISOString();
    const path = req.path;
    const method = req.method;

    // Handle DomainError (business rule violations)
    if (err instanceof DomainError) {
      logger.warn('Domain error', {
        traceId,
        code: err.code,
        message: err.message,
        path,
        method,
      });

      res.status(400).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          traceId,
          timestamp,
        },
      });
      return;
    }

    // Handle ValidationError (request validation failures)
    if (err instanceof ValidationError) {
      logger.warn('Validation error', {
        traceId,
        code: err.code,
        message: err.message,
        details: err.details,
        path,
        method,
      });

      res.status(400).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          traceId,
          timestamp,
        },
      });
      return;
    }

    // Handle ApplicationError (repository, service, use case failures)
    if (err instanceof ApplicationError) {
      const statusCode = err.statusCode || 500;
      const logLevel = statusCode < 500 ? 'warn' : 'error';

      logger[logLevel as 'warn' | 'error']('Application error', {
        traceId,
        code: err.code,
        message: err.message,
        statusCode,
        path,
        method,
      });

      res.status(statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          traceId,
          timestamp,
        },
      });
      return;
    }

    // Handle standard Error
    if (err instanceof Error) {
      logger.error('Unhandled error', {
        traceId,
        name: err.name,
        message: err.message,
        stack: err.stack,
        path,
        method,
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          traceId,
          timestamp,
        },
      });
      return;
    }

    // Handle unknown error type
    logger.error('Unknown error type', {
      traceId,
      error: String(err),
      path,
      method,
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        traceId,
        timestamp,
      },
    });
  };
}

/**
 * Async error wrapper - use to wrap async route handlers
 * Catches promise rejections and passes them to error handler
 *
 * Usage:
 *   app.get('/route', asyncHandler(async (req, res) => {
 *     const result = await someAsync();
 *     res.json(result);
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
