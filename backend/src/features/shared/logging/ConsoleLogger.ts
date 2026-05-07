import type { ILogger, LogContext } from './ILogger';
import type { LogEnvelope, LogLevel, ErrorEnvelope } from './log.types';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface AppMeta {
  service: string;
  environment: string;
  runtime: string;
  minLevel: LogLevel;
}

function formatError(error: unknown, environment: string): ErrorEnvelope {
  if (error instanceof Error) {
    const envelope: ErrorEnvelope = {
      name: error.name,
      message: error.message,
    };

    if (environment !== 'production') {
      envelope.stack = error.stack;
    }

    if ('code' in error) envelope.code = (error as any).code as string;
    if ('statusCode' in error) envelope.statusCode = (error as any).statusCode as number;
    if ('details' in error) envelope.details = (error as any).details;

    return envelope;
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

export class ConsoleLogger implements ILogger {
  constructor(
    private readonly meta: AppMeta,
    private readonly bindings: LogContext = {}
  ) {}

  debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.write('error', message, context, error);
  }

  child(bindings: LogContext): ILogger {
    return new ConsoleLogger(this.meta, { ...this.bindings, ...bindings });
  }

  private write(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.meta.minLevel]) return;

    const merged = { ...this.bindings, ...context };
    const { traceId, ...rest } = merged;

    const envelope: LogEnvelope = {
      timestamp: new Date().toISOString(),
      level,
      service: this.meta.service,
      environment: this.meta.environment,
      runtime: this.meta.runtime,
      message,
    };

    if (traceId !== undefined) envelope.traceId = String(traceId);
    if (Object.keys(rest).length > 0) envelope.context = rest;
    if (error !== undefined) envelope.error = formatError(error, this.meta.environment);

    const line = JSON.stringify(envelope) + '\n';

    if (level === 'error' || level === 'warn') {
      process.stderr.write(line);
    } else {
      process.stdout.write(line);
    }
  }
}
