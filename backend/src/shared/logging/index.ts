import { createLogger } from './LoggerFactory';
import type { ILogger } from './ILogger';
import type { AppConfig } from '../config';

export type { ILogger } from './ILogger';
export type { LogContext, LogLevel, LogEnvelope, ErrorEnvelope } from './log.types';

let _logger: ILogger | undefined;

export function initLogger(config: AppConfig): ILogger {
  if (_logger) return _logger;
  _logger = createLogger(config);
  return _logger;
}

export function getLogger(): ILogger {
  if (!_logger) {
    throw new Error('Logger not initialized. Call initLogger() at application startup.');
  }
  return _logger;
}

export function _resetLogger(): void {
  _logger = undefined;
}
