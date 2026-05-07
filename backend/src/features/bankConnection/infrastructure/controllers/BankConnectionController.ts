import { Response, NextFunction } from 'express';
import type { InitiateBankConnectionUseCase } from '../../application/useCases/InitiateBankConnection/InitiateBankConnectionUseCase';
import type { FinalizeBankConnectionUseCase } from '../../application/useCases/FinalizeBankConnection/FinalizeBankConnectionUseCase';
import type { ICustomerRepository } from '../../../customer/types/customer.types';
import { ApplicationError } from '@/core/domain/errors';
import type { AuthenticatedRequest } from '../../../shared/types/auth';

export class BankConnectionController {
  constructor(
    private initiateOAuth: InitiateBankConnectionUseCase,
    private handleCallbackUseCase: FinalizeBankConnectionUseCase,
    private customerRepository: ICustomerRepository
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

    const customerIdResult = await this.customerRepository.findCustomerIdByUserId(userId);
    if (customerIdResult.isFail) {
      return next(customerIdResult.getError());
    }

    const customerId = customerIdResult.getOrThrow();
    if (!customerId) {
      return next(
        new ApplicationError(
          'CUSTOMER_NOT_LINKED',
          'No customer account linked to this user. Please complete account setup first.',
          400
        )
      );
    }

    const result = await this.initiateOAuth.execute({ customerId });
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

  async handleCallback(req: any, res: Response, next: NextFunction): Promise<void> {
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
