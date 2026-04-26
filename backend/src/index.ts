import 'dotenv/config';
import { initConfig } from './shared/config';
import { initLogger } from './shared/logging';
import { createApp } from './app';
import { prisma } from './utils/db';

async function main() {
  const config = await initConfig();
  const logger = initLogger(config);
  const app = createApp(config, logger, prisma);

  const server = app.listen(config.server.port, () => {
    logger.info('Bridge backend started', {
      port: config.server.port,
      runtime: config.runtime,
      database: config.database.provider,
    });
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

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
