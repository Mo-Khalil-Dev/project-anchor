import { createLogger } from '../../../../src/features/shared/logging/LoggerFactory';
import { ConsoleLogger } from '../../../../src/features/shared/logging/ConsoleLogger';
import type { AppConfig } from '../../../../src/features/shared/config';

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
    jwtSecret: 'secret',
    cognito: { userPoolId: 'pool', clientId: 'client', region: 'us-east-1' },
  },
  aws: { region: 'us-east-1' },
  tink: {
    clientId: 'id',
    clientSecret: 'secret',
    environment: 'sandbox',
    linkBaseUrl: 'https://link.tink.com',
    apiBaseUrl: 'https://api.tink.com',
    expensesApiBaseUrl: 'https://expenses.tink.com',
  },
  stripe: { secretKey: 'sk_test', webhookSecret: 'whsec' },
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

  it('respects the log level from config', () => {
    const output: string[] = [];
    jest.spyOn(process.stdout, 'write').mockImplementation((data) => {
      output.push(String(data));
      return true;
    });

    const logger = createLogger(makeConfig({ logging: { level: 'warn' } }));
    logger.info('should be filtered');

    expect(output).toHaveLength(0);
    jest.restoreAllMocks();
  });
});
