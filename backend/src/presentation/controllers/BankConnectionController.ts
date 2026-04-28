import { Request, Response, NextFunction } from 'express';
import type { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import type { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import type { PrismaCustomerRepository } from '../../infrastructure/persistence/PrismaCustomerRepository';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import type { AuthenticatedRequest } from '@/presentation/middleware/authenticateRequest';

export class BankConnectionController {
  constructor(
    private initiateOAuth: InitiateBankOAuthUseCase,
    private handleCallbackUseCase: HandleBankOAuthCallbackUseCase,
    private customerRepository: PrismaCustomerRepository,
  ) {}

  async initiateOAuthFlow(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ApplicationError('UNAUTHORIZED', 'User not authenticated', 401));
    }

    // Resolve the User's linked Customer ID
    const customerIdResult = await this.customerRepository.findCustomerIdByUserId(userId);
    if (customerIdResult.isFail) {
      return next(customerIdResult.getError());
    }

    const customerId = customerIdResult.getOrThrow();
    if (!customerId) {
      return next(new ApplicationError('CUSTOMER_NOT_LINKED', 'No customer account linked to this user. Please complete account setup first.', 400));
    }

    const result = await this.initiateOAuth.execute(customerId);
    result.match(
      (data) => {
        res.json({ success: true, data });
        return res;
      },
      (error) => {
        next(error);
        return res;
      }
    );
  }

  async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code, state } = req.query as { code: string; state: string };

    if (!code || !state) {
      return next(new ApplicationError('MISSING_PARAMS', 'Missing code or state parameter', 400));
    }

    const result = await this.handleCallbackUseCase.execute(code, state);
    result.match(
      (data) => {
        res.json({ success: true, data });
        return res;
      },
      (error) => {
        next(error);
        return res;
      }
    );
  }
}
