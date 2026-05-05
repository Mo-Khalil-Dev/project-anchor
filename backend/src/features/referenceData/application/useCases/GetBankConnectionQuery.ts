import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IBankConnectionRepository } from '../../../bankConnection/types/bankConnection.types';
import type { BankConnectionData } from './GetReferenceDataUseCase.dto';

export class GetBankConnectionQuery {
  constructor(
    private bankConnectionRepository: IBankConnectionRepository,
    private logger: ILogger,
  ) {}

  async execute(input: { customerId: string }): Promise<Result<BankConnectionData | null, Error>> {
    try {
      const { customerId } = input;

      const bankConnectionResult = await this.bankConnectionRepository.findByCustomerId(customerId);

      if (bankConnectionResult.isFail) {
        this.logger.error('Failed to fetch bank connection', {
          customerId,
          error: bankConnectionResult.getError(),
        });
        return Result.fail(new Error('Failed to fetch bank connection data'));
      }

      const bankConnection = bankConnectionResult.getOrElse(null);

      if (!bankConnection) {
        return Result.ok(null);
      }

      const status = bankConnection.status === 'DATA_RETRIEVED'
        ? 'CONNECTED'
        : bankConnection.status === 'PENDING'
        ? 'IN_PROGRESS'
        : 'NOT_STARTED';

      const bankConnectionData: BankConnectionData = {
        status,
        bankName: null, // TODO: Extract from bank data when available
        accountNumber: null, // TODO: Extract and mask last 4 digits when available
        connectedAt: bankConnection.connectedAt ? bankConnection.connectedAt.toISOString() : null,
      };

      return Result.ok(bankConnectionData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetBankConnection query failed', {
        error: message,
      });
      return Result.fail(new Error(`Failed to get bank connection: ${message}`));
    }
  }
}
