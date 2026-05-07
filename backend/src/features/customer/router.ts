import { Router, type RequestHandler } from 'express';
import type { PrismaClient } from '@prisma/client';
import type { ILogger } from '../shared/logging';

// Import use cases
import { LinkUserToCustomerUseCase } from './services/LinkUserToCustomerUseCase';

// Import repositories
import { PrismaCustomerRepository } from './repositories/PrismaCustomerRepository';

// Import controller
import { CustomerController } from './controllers/CustomerController';

// Import shared utilities
import { asyncHandler } from '@/features/shared/middleware';

export function createCustomerRouter(
  _prisma: PrismaClient,
  logger: ILogger,
  authenticateRequest: RequestHandler
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  // Create repositories
  const customerRepository = new PrismaCustomerRepository();

  // Create use cases
  const linkUserToCustomerUseCase = new LinkUserToCustomerUseCase(customerRepository, logger);

  // Create controller
  const controller = new CustomerController(linkUserToCustomerUseCase);

  // ============ ROUTES ============

  /**
   * POST /api/customer/setup
   * Protected: requires authentication
   * Links authenticated user to a customer based on utility account details
   */
  router.post(
    '/setup',
    authenticateRequest,
    asyncHandler(controller.linkUserToCustomer.bind(controller))
  );

  return router;
}
