import { Request, Response, NextFunction } from 'express';
import type { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import type { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import type { PollBankDataUseCase } from '../../application/bank-connection/PollBankDataUseCase';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export class BankConnectionController {
  constructor(
    private initiateOAuth: InitiateBankOAuthUseCase,
    private handleCallbackUseCase: HandleBankOAuthCallbackUseCase,
    private pollData: PollBankDataUseCase,
  ) {}

  async initiateOAuthFlow(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const customerId = req.customer?.id;
    if (!customerId) {
      return next(new ApplicationError('MISSING_CUSTOMER', 'Missing customer context', 401));
    }

    const result = await this.initiateOAuth.execute(customerId);
    result.match(
      (data) => {
        res.json(data);
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
        res.json(data);
        return res;
      },
      (error) => {
        next(error);
        return res;
      }
    );
  }

  async pollStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { connectionId } = req.params;

    const result = await this.pollData.execute(connectionId);
    result.match(
      (data) => {
        res.json(data);
        return res;
      },
      (error) => {
        next(error);
        return res;
      }
    );
  }
}
