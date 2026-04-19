export interface LogContext {
  [key: string]: any;
}

export class Logger {
  info(message: string | LogContext, context?: LogContext) {
    const entry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      service: 'bridge-backend',
      ...(typeof message === 'string' ? { message, ...context } : message),
    };
    console.log(JSON.stringify(entry));
  }

  warn(message: string | LogContext, context?: LogContext) {
    const entry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      service: 'bridge-backend',
      ...(typeof message === 'string' ? { message, ...context } : message),
    };
    console.warn(JSON.stringify(entry));
  }

  error(message: string | LogContext, context?: LogContext) {
    const entry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'bridge-backend',
      ...(typeof message === 'string' ? { message, ...context } : message),
    };
    console.error(JSON.stringify(entry));
  }

  debug(message: string | LogContext, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      const entry = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        service: 'bridge-backend',
        ...(typeof message === 'string' ? { message, ...context } : message),
      };
      console.log(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();
