import app from './app';
import { logger } from './utils/logger';
import { prisma } from './utils/db';

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Bridge backend running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');

  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Rejection',
    reason,
    promise,
  });
});

// Uncaught exception
process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
