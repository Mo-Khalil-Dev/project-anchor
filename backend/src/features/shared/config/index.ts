import { createConfig } from './config.factory';
import type { AppConfig } from './config.types';

export type { AppConfig } from './config.types';

let _config: AppConfig | undefined;

export async function initConfig(): Promise<AppConfig> {
  if (_config) return _config;
  _config = await createConfig();
  return _config;
}

export function getConfig(): AppConfig {
  if (!_config) {
    throw new Error('Config not initialized. Call initConfig() at application startup.');
  }
  return _config;
}

export function _resetConfig(): void {
  _config = undefined;
}
