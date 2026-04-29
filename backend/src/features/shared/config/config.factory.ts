import { configSchema } from './config.schema';
import { fetchSecretsFromManager } from './providers/secrets-manager.provider';
import type { AppConfig } from './config.types';

export async function createConfig(): Promise<AppConfig> {
  const runtime = process.env.RUNTIME ?? 'local';
  let rawEnv: Record<string, string | undefined> = { ...process.env };

  if (runtime === 'ecs') {
    const secretName = process.env.SECRETS_MANAGER_SECRET_NAME;
    const region = process.env.AWS_REGION ?? 'us-east-1';

    if (!secretName) {
      throw new Error('SECRETS_MANAGER_SECRET_NAME is required when RUNTIME=ecs');
    }

    const secrets = await fetchSecretsFromManager(secretName, region);
    rawEnv = { ...rawEnv, ...secrets };
  }

  const result = configSchema.safeParse(rawEnv);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuration validation failed:\n${errors}`);
  }

  return Object.freeze(result.data) as AppConfig;
}
