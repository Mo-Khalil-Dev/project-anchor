import type { AppConfig } from '../config.types';
import { IAuthProvider } from '@/features/auth/application/services/IAuthProvider';

export function initAuthProvider(config: AppConfig): IAuthProvider {
  const provider = config.auth.provider;

  switch (provider) {
    case 'mock':
      return createMockAuthProvider(config);
    case 'cognito':
      return createCognitoAuthProvider(config);
    case 'auth0':
      throw new Error('Auth0 provider not yet implemented');
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }
}

// Alias for backwards compatibility
export const createAuthProvider = initAuthProvider;

function createMockAuthProvider(config: AppConfig): IAuthProvider {
  const MockAuthProvider =
    require('../../../auth/infrastructure/services/authProviders/MockAuthProvider').MockAuthProvider;
  return new MockAuthProvider(config);
}

function createCognitoAuthProvider(config: AppConfig): IAuthProvider {
  const { userPoolId, clientId, region } = config.auth.cognito;

  if (!userPoolId || !clientId) {
    throw new Error('COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID are required for cognito provider');
  }

  const CognitoAuthProvider =
    require('../../../auth/infrastructure/services/authProviders/CognitoAuthProvider').CognitoAuthProvider;
  return new CognitoAuthProvider({ userPoolId, clientId, region });
}
