import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import type { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export class BankConnectionController {
  constructor(
    private initiateOAuth: InitiateBankOAuthUseCase,
    private handleCallbackUseCase: HandleBankOAuthCallbackUseCase,
  ) {}

  async initiateOAuthFlow(_: Request, res: Response, next: NextFunction): Promise<void> {
    const customerId = uuidv4();

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
