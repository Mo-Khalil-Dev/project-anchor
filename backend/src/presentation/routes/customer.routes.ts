import { Router, RequestHandler } from 'express';
import type { ILogger } from '../../shared/logging';
import { asyncHandler } from '../middleware';
import { CustomerController } from '../controllers/CustomerController';
import { LinkUserToCustomerUseCase } from '../../application/use-cases/customer/LinkUserToCustomerUseCase';
import { PrismaCustomerRepository } from '../../infrastructure/persistence/PrismaCustomerRepository';

export function createCustomerRoutes(
  logger: ILogger,
  authenticateRequest: RequestHandler
) {
  const router = Router();

  // Initialize dependencies
  const customerRepository = new PrismaCustomerRepository();
  const linkUserToCustomerUseCase = new LinkUserToCustomerUseCase(
    customerRepository,
    logger
  );

  // Initialize controller
  const controller = new CustomerController(linkUserToCustomerUseCase);

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
