import type { IAuthProvider } from '../../../domain/auth/IAuthProvider';
import type { AppConfig } from '../config.types';
import { ProviderConfigError } from '../../../domain/auth/AuthErrors';

export function createAuthProvider(config: AppConfig): IAuthProvider {
  const provider = config.auth.provider;

  switch (provider) {
    case 'mock':
      return createMockAuthProvider(config);
    case 'cognito':
      return createCognitoAuthProvider(config);
    case 'auth0':
      throw new ProviderConfigError('Auth0 provider not yet implemented');
    default:
      throw new ProviderConfigError(`Unknown auth provider: ${provider}`);
  }
}

function createMockAuthProvider(config: AppConfig): IAuthProvider {
  const MockAuthProvider = require('../../../infrastructure/auth/MockAuthProvider').MockAuthProvider;
  return new MockAuthProvider(config);
}

function createCognitoAuthProvider(config: AppConfig): IAuthProvider {
  const { userPoolId, clientId, region } = config.auth.cognito;

  if (!userPoolId || !clientId) {
    throw new ProviderConfigError(
      'COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID are required for cognito provider'
    );
  }

  const CognitoAuthProvider = require('../../../infrastructure/auth/CognitoAuthProvider').CognitoAuthProvider;
  return new CognitoAuthProvider({ userPoolId, clientId, region });
}
