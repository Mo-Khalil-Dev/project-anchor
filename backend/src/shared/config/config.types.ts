export interface AppConfig {
  env: 'development' | 'production' | 'test';
  runtime: 'local' | 'docker' | 'ecs';
  server: {
    port: number;
    frontendUrl: string;
    backendUrl: string;
    redirectUrl: string;
  };
  database: {
    provider: 'sqlite' | 'postgresql';
    url: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  auth: {
    jwtSecret: string;
    cognito: {
      userPoolId: string;
      clientId: string;
      region: string;
    };
  };
  aws: {
    region: string;
    accountId?: string;
    secretsManagerSecretName?: string;
  };
  tink: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
    linkBaseUrl: string;
    apiBaseUrl: string;
    expensesApiBaseUrl: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  email: {
    region: string;
    fromAddress: string;
  };
  features: {
    emailEnabled: boolean;
    paymentProcessing: boolean;
    bankOAuth: boolean;
    errorStackTracesEnabled: boolean;
  };
}
