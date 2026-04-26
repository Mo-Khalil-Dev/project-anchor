import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupAuthRoutes } from '../../presentation/routes/auth.routes';
import { authenticateRequest } from '../../presentation/middleware/authenticateRequest';
import { InitiateLoginUseCase } from '../../application/use-cases/auth/InitiateLoginUseCase';
import { HandleAuthCallbackUseCase } from '../../application/use-cases/auth/HandleAuthCallbackUseCase';
import { RefreshAccessTokenUseCase } from '../../application/use-cases/auth/RefreshAccessTokenUseCase';
import { ValidateTokenUseCase } from '../../application/use-cases/auth/ValidateTokenUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { GetRedirectToJourneyUseCase } from '../../application/use-cases/auth/GetRedirectToJourneyUseCase';
import { TokenService } from '../../application/services/TokenService';
import { createAuthProvider } from './auth-provider.factory';
import type { AppConfig } from '../../shared/config';

export function initializeAuthDependencies(router: Router, config: AppConfig, prisma: PrismaClient) {
  // Initialize auth provider
  const authProvider = createAuthProvider(config);

  // Initialize services
  const tokenService = new TokenService(config, prisma);

  // Initialize use cases
  const initiateLoginUseCase = new InitiateLoginUseCase(authProvider);
  const handleAuthCallbackUseCase = new HandleAuthCallbackUseCase(authProvider, tokenService, prisma);
  const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(authProvider, tokenService);
  const validateTokenUseCase = new ValidateTokenUseCase(authProvider);
  const logoutUseCase = new LogoutUseCase(tokenService, prisma);
  const getRedirectToJourneyUseCase = new GetRedirectToJourneyUseCase(prisma);

  // Create middleware
  const createAuthMiddleware = () => authenticateRequest(validateTokenUseCase);

  // Setup routes
  setupAuthRoutes(
    router,
    initiateLoginUseCase,
    handleAuthCallbackUseCase,
    refreshAccessTokenUseCase,
    logoutUseCase,
    getRedirectToJourneyUseCase,
    createAuthMiddleware()
  );
}
