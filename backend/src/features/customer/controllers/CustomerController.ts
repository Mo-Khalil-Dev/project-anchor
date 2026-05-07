import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticateRequest';
import type { LinkUserToCustomerUseCase } from '../services/LinkUserToCustomerUseCase';
import { ApplicationError } from '../../../core/domain/errors/applicationError';

export class CustomerController {
  constructor(private linkUserToCustomerUseCase: LinkUserToCustomerUseCase) {}

  /**
   * POST /api/customer/setup
   *
   * Link authenticated user to a customer based on utility account details.
   * Requires: authenticated user (JWT token)
   *
   * Request body:
   * {
   *   utilityType: 'Electricity' | 'Gas' | 'Water',
   *   postcode: string (6-8 chars),
   *   accountReference: string (1-50 chars)
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     id: string,
   *     email: string,
   *     utilityType: string | null,
   *     postcode: string | null,
   *     utilityAccountNo: string | null,
   *     createdAt: Date
   *   }
   * }
   */
  async linkUserToCustomer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new ApplicationError('UNAUTHORIZED', 'User not authenticated', 401));
      }

      const { utilityType, postcode, accountReference } = req.body;

      // Call use case
      const result = await this.linkUserToCustomerUseCase.execute(userId, {
        utilityType,
        postcode,
        accountReference,
      });

      // Handle result
      result.match(
        (data) => {
          res.status(200).json({
            success: true,
            data,
          });
        },
        (error) => {
          // Validation or business logic errors
          const message = error.message || 'Failed to link customer';
          next(new ApplicationError('CUSTOMER_LINK_FAILED', message, 400));
        }
      );
    } catch (error) {
      // TODO: This outer try/catch is redundant — the use case returns Result.fail instead of
      // throwing, and result.match() routes errors to next(). Remove once confident no
      // unexpected throws can escape the use case boundary.
      const message = error instanceof Error ? error.message : String(error);
      next(new ApplicationError('INTERNAL_ERROR', `Account setup error: ${message}`, 500));
    }
  }
}
