import type { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/AuthController';
import type { InitiateLoginUseCase } from '../../application/use-cases/auth/InitiateLoginUseCase';
import type { HandleAuthCallbackUseCase } from '../../application/use-cases/auth/HandleAuthCallbackUseCase';
import type { RefreshAccessTokenUseCase } from '../../application/use-cases/auth/RefreshAccessTokenUseCase';
import type { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import type { GetRedirectToJourneyUseCase } from '../../application/use-cases/auth/GetRedirectToJourneyUseCase';

export function setupAuthRoutes(
  router: Router,
  initiateLoginUseCase: InitiateLoginUseCase,
  handleAuthCallbackUseCase: HandleAuthCallbackUseCase,
  refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
  logoutUseCase: LogoutUseCase,
  getRedirectToJourneyUseCase: GetRedirectToJourneyUseCase,
  authenticateRequest: RequestHandler
) {
  const authController = new AuthController(
    initiateLoginUseCase,
    handleAuthCallbackUseCase,
    refreshAccessTokenUseCase,
    logoutUseCase,
    getRedirectToJourneyUseCase
  );

  // Public endpoints (no auth required)
  router.get('/auth/initiate-login', (req, res) =>
    authController.initiateLogin(req as any, res)
  );

  router.get('/auth/mock-login', (req, res) =>
    authController.mockLogin(req as any, res)
  );

  router.post('/auth/callback', (req, res) =>
    authController.handleCallback(req as any, res)
  );

  router.get('/auth/callback', (req, res) =>
    authController.handleCallback(req as any, res)
  );

  router.get('/auth/refresh', (req, res) =>
    authController.refreshToken(req as any, res)
  );

  router.post('/auth/logout', (req, res) =>
    authController.logout(req as any, res)
  );

  // Protected endpoints (auth required)
  router.get('/auth/me', authenticateRequest, (req, res) =>
    authController.getCurrentUser(req as any, res)
  );

  router.get('/auth/redirect-to-journey', authenticateRequest, (req, res) =>
    authController.getRedirectToJourney(req as any, res)
  );
}
