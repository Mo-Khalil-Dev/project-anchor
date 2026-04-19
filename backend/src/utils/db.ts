import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Create single instance of Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: any) => {
    logger.debug({
      message: 'Database Query',
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });

  (prisma as any).$on('error', (e: any) => {
    logger.error({
      message: 'Database Error',
      error: e.message,
    });
  });

  (prisma as any).$on('warn', (e: any) => {
    logger.warn({
      message: 'Database Warning',
      warning: e.message,
    });
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
