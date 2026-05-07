import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { ILogger } from '../logging';
import { ApplicationError, ValidationError, DomainError } from '@/core/domain/errors';

export function globalErrorHandler(logger: ILogger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const traceId = uuidv4();
    const timestamp = new Date().toISOString();
    const requestContext = { traceId, path: req.path, method: req.method };

    if (err instanceof DomainError) {
      logger.warn('Domain error', { ...requestContext, code: err.code, message: err.message });

      res.status(400).json({
        success: false,
        error: err.message,
        timestamp,
      });
      return;
    }

    if (err instanceof ValidationError) {
      logger.warn('Validation error', { ...requestContext, code: err.code, details: err.details });

      res.status(400).json({
        success: false,
        error: err.message,
        timestamp,
      });
      return;
    }

    if (err instanceof ApplicationError) {
      const statusCode = err.statusCode || 500;

      if (statusCode < 500) {
        logger.warn('Application error', { ...requestContext, code: err.code, statusCode });
      } else {
        logger.error('Application error', err, requestContext);
      }

      res.status(statusCode).json({
        success: false,
        error: err.message,
        timestamp,
      });
      return;
    }

    if (err instanceof Error) {
      logger.error('Unhandled error', err, requestContext);

      res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred',
        timestamp,
      });
      return;
    }

    logger.error('Unknown error type', err, requestContext);

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
      timestamp,
    });
  };
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
