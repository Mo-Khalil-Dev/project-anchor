import { createConfig } from './config.factory';

jest.mock('./providers/secrets-manager.provider');
import { fetchSecretsFromManager } from './providers/secrets-manager.provider';

const mockedFetchSecrets = fetchSecretsFromManager as jest.MockedFunction<typeof fetchSecretsFromManager>;

const VALID_ENV: Record<string, string> = {
  NODE_ENV: 'development',
  RUNTIME: 'local',
  PORT: '3000',
  FRONTEND_URL: 'http://localhost:5173',
  DATABASE_PROVIDER: 'sqlite',
  LOG_LEVEL: 'info',
  JWT_SECRET: 'test-jwt-secret-for-unit-tests-minimum-length',
  COGNITO_USER_POOL_ID: 'us-east-1_TestPool',
  COGNITO_CLIENT_ID: 'test-client-id',
  COGNITO_REGION: 'us-east-1',
  AWS_REGION: 'us-east-1',
  TINK_CLIENT_ID: 'tink-client-id',
  TINK_CLIENT_SECRET: 'tink-client-secret',
  TINK_ENVIRONMENT: 'sandbox',
  SES_FROM_ADDRESS: 'test@bridge.local',
  STRIPE_SECRET_KEY: 'sk_test_xxx',
  STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
};

const VALID_POSTGRESQL_ENV: Record<string, string> = {
  ...VALID_ENV,
  DATABASE_PROVIDER: 'postgresql',
  DATABASE_URL: 'postgresql://bridge_user:dev_password@localhost:5432/bridge',
};

describe('createConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...VALID_ENV };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('happy path', () => {
    it('parses env vars into nested AppConfig', async () => {
      const config = await createConfig();

      expect(config.env).toBe('development');
      expect(config.runtime).toBe('local');
      expect(config.server.port).toBe(3000);
      expect(config.server.frontendUrl).toBe('http://localhost:5173');
      expect(config.logging.level).toBe('info');
      expect(config.auth.jwtSecret).toBe(VALID_ENV.JWT_SECRET);
      expect(config.auth.cognito.userPoolId).toBe('us-east-1_TestPool');
      expect(config.tink.environment).toBe('sandbox');
      expect(config.stripe.secretKey).toBe('sk_test_xxx');
    });

    it('applies sensible defaults', async () => {
      const { LOG_LEVEL, TINK_ENVIRONMENT, PORT, ...withoutDefaults } = VALID_ENV;
      process.env = { ...originalEnv, ...withoutDefaults };

      const config = await createConfig();

      expect(config.server.port).toBe(3000);
      expect(config.logging.level).toBe('info');
      expect(config.tink.environment).toBe('sandbox');
      expect(config.aws.region).toBe('us-east-1');
    });

    it('parses ENABLE_* feature flags from strings', async () => {
      process.env = { ...originalEnv, ...VALID_ENV, ENABLE_EMAIL: 'false', ENABLE_BANK_OAUTH: 'false' };

      const config = await createConfig();

      expect(config.features.emailEnabled).toBe(false);
      expect(config.features.bankOAuth).toBe(false);
      expect(config.features.paymentProcessing).toBe(true);
    });

    it('feature flags default to true when not set', async () => {
      const config = await createConfig();

      expect(config.features.emailEnabled).toBe(true);
      expect(config.features.paymentProcessing).toBe(true);
      expect(config.features.bankOAuth).toBe(true);
    });

    it('returns a frozen config object', async () => {
      const config = await createConfig();

      expect(Object.isFrozen(config)).toBe(true);
    });
  });

  describe('database provider selection', () => {
    it('uses sqlite with default file URL when DATABASE_PROVIDER=sqlite and no DATABASE_URL', async () => {
      const config = await createConfig();

      expect(config.database.provider).toBe('sqlite');
      expect(config.database.url).toBe('file:./prisma/dev.db');
    });

    it('uses sqlite with custom DATABASE_URL when explicitly set', async () => {
      process.env = { ...originalEnv, ...VALID_ENV, DATABASE_URL: 'file:/custom/path.db' };

      const config = await createConfig();

      expect(config.database.provider).toBe('sqlite');
      expect(config.database.url).toBe('file:/custom/path.db');
    });

    it('uses postgresql when DATABASE_PROVIDER=postgresql with DATABASE_URL', async () => {
      process.env = { ...originalEnv, ...VALID_POSTGRESQL_ENV };

      const config = await createConfig();

      expect(config.database.provider).toBe('postgresql');
      expect(config.database.url).toBe(VALID_POSTGRESQL_ENV.DATABASE_URL);
    });

    it('defaults to sqlite when RUNTIME=local and DATABASE_PROVIDER is not set', async () => {
      const { DATABASE_PROVIDER, ...envWithoutProvider } = VALID_ENV;
      process.env = { ...originalEnv, ...envWithoutProvider };

      const config = await createConfig();

      expect(config.database.provider).toBe('sqlite');
    });

    it('defaults to postgresql when RUNTIME=docker and DATABASE_PROVIDER is not set', async () => {
      const { DATABASE_PROVIDER, ...envWithoutProvider } = VALID_ENV;
      process.env = {
        ...originalEnv,
        ...envWithoutProvider,
        RUNTIME: 'docker',
        DATABASE_URL: 'postgresql://localhost/bridge',
      };

      const config = await createConfig();

      expect(config.database.provider).toBe('postgresql');
    });

    it('throws when DATABASE_PROVIDER=postgresql and DATABASE_URL is missing', async () => {
      const { DATABASE_URL, ...envWithoutUrl } = VALID_POSTGRESQL_ENV;
      process.env = { ...originalEnv, ...envWithoutUrl };

      await expect(createConfig()).rejects.toThrow('DATABASE_URL is required when DATABASE_PROVIDER=postgresql');
    });
  });

  describe('validation failures', () => {
    it('throws with clear message when JWT_SECRET is missing', async () => {
      const { JWT_SECRET, ...env } = VALID_ENV;
      process.env = { ...originalEnv, ...env };

      await expect(createConfig()).rejects.toThrow('JWT_SECRET');
    });

    it('throws when multiple required vars are missing and lists all of them', async () => {
      const { JWT_SECRET, STRIPE_SECRET_KEY, ...env } = VALID_ENV;
      process.env = { ...originalEnv, ...env };

      await expect(createConfig()).rejects.toThrow('Configuration validation failed');
    });
  });

  describe('ECS runtime', () => {
    const ECS_ENV = {
      ...VALID_POSTGRESQL_ENV,
      RUNTIME: 'ecs',
      SECRETS_MANAGER_SECRET_NAME: 'bridge/production/secrets',
    };

    it('fetches secrets from Secrets Manager and merges them', async () => {
      process.env = { ...originalEnv, ...ECS_ENV };
      mockedFetchSecrets.mockResolvedValue({
        JWT_SECRET: 'production-jwt-secret-from-aws',
        DATABASE_URL: 'postgresql://prod_user:prod_pass@rds.example.com:5432/bridge',
      });

      const config = await createConfig();

      expect(mockedFetchSecrets).toHaveBeenCalledWith('bridge/production/secrets', 'us-east-1');
      expect(config.auth.jwtSecret).toBe('production-jwt-secret-from-aws');
      expect(config.database.url).toBe('postgresql://prod_user:prod_pass@rds.example.com:5432/bridge');
      expect(config.runtime).toBe('ecs');
    });

    it('secrets from Secrets Manager override task definition env vars', async () => {
      process.env = { ...originalEnv, ...ECS_ENV, DATABASE_URL: 'postgresql://overridden' };
      mockedFetchSecrets.mockResolvedValue({ DATABASE_URL: 'postgresql://secret-url' });

      const config = await createConfig();

      expect(config.database.url).toBe('postgresql://secret-url');
    });

    it('throws when SECRETS_MANAGER_SECRET_NAME is missing in ECS runtime', async () => {
      const { SECRETS_MANAGER_SECRET_NAME, ...env } = ECS_ENV;
      process.env = { ...originalEnv, ...env };

      await expect(createConfig()).rejects.toThrow('SECRETS_MANAGER_SECRET_NAME is required when RUNTIME=ecs');
    });

    it('propagates Secrets Manager fetch errors', async () => {
      process.env = { ...originalEnv, ...ECS_ENV };
      mockedFetchSecrets.mockRejectedValue(new Error('AccessDeniedException'));

      await expect(createConfig()).rejects.toThrow('AccessDeniedException');
    });
  });
});
