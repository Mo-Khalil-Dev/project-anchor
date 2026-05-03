import { z } from 'zod';

const boolFlag = z.string().default('true').transform((v) => v === 'true');

const SQLITE_DEFAULT_URL = 'file:./prisma/dev.db';

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RUNTIME: z.enum(['local', 'docker', 'ecs']).default('local'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  REDIRECT_URL: z.string().optional(),

  // DATABASE_PROVIDER matches Prisma's provider names: sqlite | postgresql
  // Defaults: local → sqlite, docker/ecs → postgresql
  DATABASE_PROVIDER: z.enum(['sqlite', 'postgresql']).optional(),
  DATABASE_URL: z.string().optional(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  AUTH_PROVIDER: z.enum(['mock', 'cognito', 'auth0']).default('mock'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  COGNITO_USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
  COGNITO_REGION: z.string().default('us-east-1'),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCOUNT_ID: z.string().optional(),
  SECRETS_MANAGER_SECRET_NAME: z.string().optional(),

  TINK_CLIENT_ID: z.string().min(1, 'TINK_CLIENT_ID is required'),
  TINK_CLIENT_SECRET: z.string().min(1, 'TINK_CLIENT_SECRET is required'),
  TINK_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  TINK_LINK_BASE_URL: z.string().default('https://link.tink.com'),
  TINK_API_BASE_URL: z.string().default('https://api.tink.com'),
  TINK_EXPENSES_API_BASE_URL: z.string().default('https://api.tink.com/risk/v1'),
  BACKEND_URL: z.string().optional(),

  SES_REGION: z.string().default('us-east-1'),
  SES_FROM_ADDRESS: z.string().email('SES_FROM_ADDRESS must be a valid email').default('noreply@bridge.local'),

  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  GOCARDLESS_ACCESS_TOKEN: z.string().default(''),
  GOCARDLESS_WEBHOOK_KEY: z.string().default(''),

  ENABLE_EMAIL: boolFlag,
  ENABLE_PAYMENT_PROCESSING: boolFlag,
  ENABLE_BANK_OAUTH: boolFlag,
  ENABLE_ERROR_STACK_TRACES: boolFlag.default('false'),
}).superRefine((env, ctx) => {
  const provider = env.DATABASE_PROVIDER ?? (env.RUNTIME === 'local' ? 'sqlite' : 'postgresql');

  if (provider === 'postgresql' && !env.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL is required when DATABASE_PROVIDER=postgresql',
    });
  }

  const authProvider = env.AUTH_PROVIDER ?? 'mock';
  if (authProvider === 'cognito') {
    if (!env.COGNITO_USER_POOL_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COGNITO_USER_POOL_ID'],
        message: 'COGNITO_USER_POOL_ID is required when AUTH_PROVIDER=cognito',
      });
    }
    if (!env.COGNITO_CLIENT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COGNITO_CLIENT_ID'],
        message: 'COGNITO_CLIENT_ID is required when AUTH_PROVIDER=cognito',
      });
    }
  }
});

export const configSchema = rawEnvSchema.transform((env) => {
  const provider = env.DATABASE_PROVIDER ?? (env.RUNTIME === 'local' ? 'sqlite' : 'postgresql');
  const dbUrl = env.DATABASE_URL ?? (provider === 'sqlite' ? SQLITE_DEFAULT_URL : '');

  return {
    env: env.NODE_ENV,
    runtime: env.RUNTIME,
    server: {
      port: env.PORT,
      frontendUrl: env.FRONTEND_URL,
      backendUrl: env.BACKEND_URL || `http://localhost:${env.PORT}`,
      redirectUrl: env.REDIRECT_URL || `${env.FRONTEND_URL}/bank-connection`,
    },
    database: {
      provider: provider as 'sqlite' | 'postgresql',
      url: dbUrl,
    },
    logging: {
      level: env.LOG_LEVEL,
    },
    auth: {
      provider: env.AUTH_PROVIDER ?? 'mock',
      jwtSecret: env.JWT_SECRET,
      cognito: {
        userPoolId: env.COGNITO_USER_POOL_ID || '',
        clientId: env.COGNITO_CLIENT_ID || '',
        region: env.COGNITO_REGION,
      },
    },
    aws: {
      region: env.AWS_REGION,
      accountId: env.AWS_ACCOUNT_ID,
      secretsManagerSecretName: env.SECRETS_MANAGER_SECRET_NAME,
    },
    tink: {
      clientId: env.TINK_CLIENT_ID,
      clientSecret: env.TINK_CLIENT_SECRET,
      environment: env.TINK_ENVIRONMENT,
      linkBaseUrl: env.TINK_LINK_BASE_URL,
      apiBaseUrl: env.TINK_API_BASE_URL,
      expensesApiBaseUrl: env.TINK_EXPENSES_API_BASE_URL,
    },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    gocardless: {
      accessToken: env.GOCARDLESS_ACCESS_TOKEN,
      webhookKey: env.GOCARDLESS_WEBHOOK_KEY,
    },
    email: {
      region: env.SES_REGION,
      fromAddress: env.SES_FROM_ADDRESS,
    },
    features: {
      emailEnabled: env.ENABLE_EMAIL,
      paymentProcessing: env.ENABLE_PAYMENT_PROCESSING,
      bankOAuth: env.ENABLE_BANK_OAUTH,
      errorStackTracesEnabled: env.ENABLE_ERROR_STACK_TRACES,
    },
  };
});
