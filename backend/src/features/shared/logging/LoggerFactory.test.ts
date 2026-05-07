import { createLogger } from './LoggerFactory';
import { ConsoleLogger } from './ConsoleLogger';
import type { AppConfig } from '../config';

const makeConfig = (overrides: Partial<AppConfig> = {}): AppConfig => ({
  env: 'development',
  runtime: 'local',
  server: {
    port: 3000,
    frontendUrl: 'http://localhost:5173',
    backendUrl: 'http://localhost:3001',
    redirectUrl: 'http://localhost:3001/callback',
  },
  database: { provider: 'sqlite', url: 'file:./dev.db' },
  logging: { level: 'info' },
  auth: {
    provider : 'mock',
    jwtSecret: 'secret',
    cognito: { userPoolId: 'pool', clientId: 'client', region: 'us-east-1' },
  },
  aws: { region: 'us-east-1' },
  tink: {
    clientId: 'id',
    clientSecret: 'secret',
    environment: 'sandbox',
    apiBaseUrl: 'https://api.tink.com',
    expensesApiBaseUrl: 'https://expenses.tink.com',
  },
  stripe: { secretKey: 'sk_test', webhookSecret: 'whsec' },
  gocardless: { accessToken: 'test_token', webhookKey: 'test_key' },
  email: { region: 'us-east-1', fromAddress: 'test@bridge.local' },
  features: {
    emailEnabled: true,
    paymentProcessing: true,
    bankOAuth: true,
    errorStackTracesEnabled: true,
  },
  ...overrides,
});

describe('LoggerFactory', () => {
  it('returns a ConsoleLogger instance', () => {
    const logger = createLogger(makeConfig());
    expect(logger).toBeInstanceOf(ConsoleLogger);
  });
});
