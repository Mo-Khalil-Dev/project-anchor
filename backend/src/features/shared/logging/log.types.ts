export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = Record<string, unknown>;

export interface LogEnvelope {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  runtime: string;
  message: string;
  traceId?: string;
  context?: LogContext;
  error?: ErrorEnvelope;
}

export interface ErrorEnvelope {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  stack?: string;
  details?: unknown;
}
