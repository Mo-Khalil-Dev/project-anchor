import { ConsoleLogger } from './ConsoleLogger';
import type { ILogger } from './ILogger';
import type { AppConfig } from '../config';

export function createLogger(config: AppConfig): ILogger {
  return new ConsoleLogger({
    service: 'bridge-backend',
    environment: config.env,
    runtime: config.runtime,
    minLevel: config.logging.level,
  });
}
