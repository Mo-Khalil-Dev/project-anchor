import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authenticateRequest';
import type { InitiateLoginUseCase } from '../../application/use-cases/auth/InitiateLoginUseCase';
import type { HandleAuthCallbackUseCase } from '../../application/use-cases/auth/HandleAuthCallbackUseCase';
import type { RefreshAccessTokenUseCase } from '../../application/use-cases/auth/RefreshAccessTokenUseCase';
import type { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';

export class AuthController {
  constructor(
    private initiateLoginUseCase: InitiateLoginUseCase,
    private handleAuthCallbackUseCase: HandleAuthCallbackUseCase,
    private refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
    private logoutUseCase: LogoutUseCase
  ) {}

  async initiateLogin(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const redirectUri = `${backendUrl}/api/auth/callback`;

      const result = await this.initiateLoginUseCase.execute({ redirectUri });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate login',
      });
    }
  }

  async handleCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;

      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Missing or invalid code/state parameters',
        });
        return;
      }

      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const redirectUri = `${backendUrl}/api/auth/callback`;

      const result = await this.handleAuthCallbackUseCase.execute({
        code,
        state,
        redirectUri,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle auth callback',
      });
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken || typeof refreshToken !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Missing or invalid refreshToken in body',
        });
        return;
      }

      const result = await this.refreshAccessTokenUseCase.execute({ refreshToken });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken, allSessions } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      await this.logoutUseCase.execute({
        userId,
        refreshToken: refreshToken as string | undefined,
        allSessions: allSessions as boolean | undefined,
      });

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      });
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      });
    }
  }
}
