import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AppConfig } from '../../shared/config';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export interface AuthenticatedRequest extends Request {
  customer?: {
    id: string;
    email: string;
  };
  traceId?: string;
}

export function createAuthMiddleware(config: AppConfig) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new ApplicationError(
        'UNAUTHORIZED',
        'Missing authorization token',
        401
      ));
    }

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as any;
      req.customer = {
        id: decoded.sub || decoded.customerId,
        email: decoded.email,
      };
      req.traceId = req.headers['x-trace-id'] as string;
      next();
    } catch (error) {
      return next(new ApplicationError(
        'UNAUTHORIZED',
        'Invalid or expired token',
        401
      ));
    }
  };
}
