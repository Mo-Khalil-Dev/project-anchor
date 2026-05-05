import { Router, type RequestHandler } from 'express';
import type { PrismaClient } from '@prisma/client';

// Import all use cases
import {
  InitiateLoginUseCase,
  HandleAuthCallbackUseCase,
  RefreshAccessTokenUseCase,
  LogoutUseCase,
  ValidateTokenUseCase,
  GetRedirectToJourneyUseCase,
} from './application/usecases';

// Import controller
import { AuthController } from '@/features/auth/infrastructure/controllers/AuthController';

// Import shared utilities
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { createAuthenticateMiddleware } from '../shared/middleware/authenticateRequest';
import { IAuthProvider } from '@/features/auth/application/services/IAuthProvider';

// Import repositories
import { PrismaUserRepository } from '@/features/auth/infrastructure/repositories/PrismaUserRepository';
import { PrismaSessionLogRepository } from '@/features/auth/infrastructure/repositories/PrismaSessionLogRepository';
import { PrismaRefreshTokenRepository } from '@/features/auth/infrastructure/repositories/PrismaRefreshTokenRepository';

// Import services
import { TokenService } from '@/features/auth/application/services/TokenService';

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
  // Create repositories
  const userRepository = new PrismaUserRepository(prisma);
  const sessionLogRepository = new PrismaSessionLogRepository(prisma);
  const tokensRepository = new PrismaRefreshTokenRepository(prisma);

  // Create services
  const tokenService = new TokenService(authProvider, tokensRepository);

  // Create all use cases
  const initiateLoginUseCase = new InitiateLoginUseCase(authProvider);
  const handleAuthCallbackUseCase = new HandleAuthCallbackUseCase(
    authProvider,
    tokenService,
    userRepository,
    sessionLogRepository
  );
  const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(tokenService);
  const logoutUseCase = new LogoutUseCase(tokenService, sessionLogRepository, userRepository);
  const validateTokenUseCase = new ValidateTokenUseCase(tokenService, userRepository);
  const getRedirectToJourneyUseCase = new GetRedirectToJourneyUseCase(userRepository);

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
