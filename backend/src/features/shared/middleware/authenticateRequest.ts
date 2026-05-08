import type { Response, NextFunction } from 'express';
import type { ValidateTokenUseCase } from '../../auth/application/usecases';
import type { AuthenticatedRequest } from '../types/auth';

export function createAuthenticateMiddleware(validateTokenUseCase: ValidateTokenUseCase) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
        return;
      }

      const accessToken = authHeader.substring('Bearer '.length);

      const result = await validateTokenUseCase.execute({ accessToken });

      if (!result.isValid) {
        res.status(401).json({ success: false, error: result.error || 'Invalid token' });
        return;
      }

      req.user = result.user;
      next();
    } catch (error) {
      res.status(401).json({ success: false, error: 'Token validation failed' });
    }
  };
}
