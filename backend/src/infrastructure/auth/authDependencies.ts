import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupAuthRoutes } from '../../presentation/routes/auth.routes';
import { createAuthenticateMiddleware } from '../../presentation/middleware/authenticateRequest';
import { InitiateLoginUseCase } from '../../application/use-cases/auth/InitiateLoginUseCase';
import { HandleAuthCallbackUseCase } from '../../application/use-cases/auth/HandleAuthCallbackUseCase';
import { RefreshAccessTokenUseCase } from '../../application/use-cases/auth/RefreshAccessTokenUseCase';
import { ValidateTokenUseCase } from '../../application/use-cases/auth/ValidateTokenUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { GetRedirectToJourneyUseCase } from '../../application/use-cases/auth/GetRedirectToJourneyUseCase';
import { createAuthProvider } from '../../shared/config/providers/auth-provider.factory';
import type { AppConfig } from '../../shared/config';

export function initializeAuthDependencies(router: Router, config: AppConfig, prisma: PrismaClient) {
  // Initialize auth provider
  const authProvider = createAuthProvider(config);

  // Initialize use cases
  const initiateLoginUseCase = new InitiateLoginUseCase(authProvider);
  const handleAuthCallbackUseCase = new HandleAuthCallbackUseCase(authProvider, prisma);
  const validateTokenUseCase = new ValidateTokenUseCase(authProvider, prisma);
  const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(authProvider, prisma);
  const logoutUseCase = new LogoutUseCase(authProvider, prisma);
  const getRedirectToJourneyUseCase = new GetRedirectToJourneyUseCase(prisma);

  // Create authentication middleware
  const authMiddleware = createAuthenticateMiddleware(validateTokenUseCase);

  // Setup routes
  setupAuthRoutes(
    router,
    initiateLoginUseCase,
    handleAuthCallbackUseCase,
    refreshAccessTokenUseCase,
    logoutUseCase,
    getRedirectToJourneyUseCase,
    authMiddleware
  );
  return {
    authMiddleware,
  };
}
