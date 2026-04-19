import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/DomainError';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { ValidationError } from '../../shared/errors/ValidationError';
import { v4 as uuidv4 } from 'uuid';
import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';

export function globalErrorHandler(logger: ILogger, config: AppConfig) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const traceId = uuidv4();
    const timestamp = new Date().toISOString();
    const requestContext = { traceId, path: req.path, method: req.method };

    if (err instanceof DomainError) {
      logger.warn('Domain error', { ...requestContext, code: err.code, message: err.message });

      res.status(400).json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details, traceId, timestamp },
      });
      return;
    }

    if (err instanceof ValidationError) {
      logger.warn('Validation error', { ...requestContext, code: err.code, details: err.details });

      res.status(400).json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details, traceId, timestamp },
      });
      return;
    }

    if (err instanceof ApplicationError) {
      const statusCode = err.statusCode || 500;
      const includeStack = config.features.errorStackTracesEnabled;

      if (statusCode < 500) {
        logger.warn('Application error', { ...requestContext, code: err.code, statusCode });
      } else {
        logger.error('Application error', err, requestContext);
      }

      res.status(statusCode).json({
        success: false,
        error: err.toJSON(includeStack),
        traceId,
        timestamp,
      });
      return;
    }

    if (err instanceof Error) {
      logger.error('Unhandled error', err, requestContext);

      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred', traceId, timestamp },
      });
      return;
    }

    logger.error('Unknown error type', err, requestContext);

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred', traceId, timestamp },
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
