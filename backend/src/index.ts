import 'dotenv/config';
import { initConfig } from './shared/config';
import { createApp } from './app';
import { logger } from './utils/logger';
import { prisma } from './utils/db';

async function main() {
  const config = await initConfig();
  const app = createApp(config);

  const server = app.listen(config.server.port, () => {
    logger.info(`Bridge backend running on port ${config.server.port} [${config.runtime}]`);
  });

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

  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ message: 'Unhandled Rejection', reason, promise });
  });

  process.on('uncaughtException', (error) => {
    logger.error({ message: 'Uncaught Exception', error: error.message, stack: error.stack });
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
