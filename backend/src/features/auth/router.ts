import { Router, type RequestHandler } from 'express';
import type { PrismaClient } from '@prisma/client';
import type { IAuthProvider } from './types/auth.types';

// Import all use cases
import { InitiateLoginUseCase } from './services/InitiateLoginUseCase';
import { HandleAuthCallbackUseCase } from './services/HandleAuthCallbackUseCase';
import { RefreshAccessTokenUseCase } from './services/RefreshAccessTokenUseCase';
import { LogoutUseCase } from './services/LogoutUseCase';
import { ValidateTokenUseCase } from './services/ValidateTokenUseCase';
import { GetRedirectToJourneyUseCase } from './services/GetRedirectToJourneyUseCase';

// Import controller
import { AuthController } from './controllers/AuthController';

// Import shared utilities
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { createAuthenticateMiddleware } from '../shared/middleware/authenticateRequest';

export interface AuthSetup {
  router: Router;
  authenticateRequest: RequestHandler;
}

export function createAuthRouter(
  authProvider: IAuthProvider,
  prisma: PrismaClient
): AuthSetup {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  // Create all use cases
  const initiateLoginUseCase = new InitiateLoginUseCase(authProvider);
  const handleAuthCallbackUseCase = new HandleAuthCallbackUseCase(authProvider, prisma);
  const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(authProvider, prisma);
  const logoutUseCase = new LogoutUseCase(authProvider, prisma);
  const validateTokenUseCase = new ValidateTokenUseCase(authProvider, prisma);
  const getRedirectToJourneyUseCase = new GetRedirectToJourneyUseCase(prisma);

  // Create authentication middleware
  const authenticateRequest = createAuthenticateMiddleware(validateTokenUseCase);

  // Create controller with use cases
  const controller = new AuthController(
    initiateLoginUseCase,
    handleAuthCallbackUseCase,
    refreshAccessTokenUseCase,
    logoutUseCase,
    getRedirectToJourneyUseCase
  );

  // ============ ROUTES ============

  // Public endpoints (no auth required)
  router.get('/auth/initiate-login', asyncHandler(
    controller.initiateLogin.bind(controller)
  ));

  router.get('/auth/mock-login', asyncHandler(
    controller.mockLogin.bind(controller)
  ));

  router.post('/auth/callback', asyncHandler(
    controller.handleCallback.bind(controller)
  ));

  router.get('/auth/callback', asyncHandler(
    controller.handleCallback.bind(controller)
  ));

  router.get('/auth/refresh', asyncHandler(
    controller.refreshToken.bind(controller)
  ));

  router.post('/auth/logout', asyncHandler(
    controller.logout.bind(controller)
  ));

  // Protected endpoints (auth required)
  router.get('/auth/me', authenticateRequest, asyncHandler(
    controller.getCurrentUser.bind(controller)
  ));

  router.get('/auth/redirect-to-journey', authenticateRequest, asyncHandler(
    controller.getRedirectToJourney.bind(controller)
  ));

  return {
    router,
    authenticateRequest,
  };
}
