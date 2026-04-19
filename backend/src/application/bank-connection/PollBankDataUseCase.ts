import { Result } from '../../shared/result';
import type { IBankConnectionRepository } from '../../domain/bank-connection/IBankConnectionRepository';
import type { ILogger } from '../../shared/logging';
import type { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';

export class PollBankDataUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private tinkService: TinkOAuthService,
    private logger: ILogger,
  ) {}

  async execute(connectionId: string): Promise<Result<{
    status: string;
    isReady: boolean;
    data?: any;
  }, Error>> {
    try {
      const connResult = await this.repository.findById(connectionId);
      if (connResult.isFail) {
        return Result.fail(connResult.getError() || new Error('Unknown error'));
      }

      const connection = connResult.getOrThrow();
      if (!connection || !connection.reportJobId) {
        return Result.fail(new Error('Connection not found or not authorized'));
      }

      const statusResult = await this.tinkService.checkReportStatus(connection.reportJobId);
      if (statusResult.isFail) {
        return Result.fail(statusResult.getError() || new Error('Unknown error'));
      }

      const statusData = statusResult.getOrThrow();

      if (statusData.status === 'COMPLETED' && statusData.reportIds) {
        const incomeResult = await this.tinkService.getIncomeReport(statusData.reportIds.incomeReportId!);
        const expenseResult = await this.tinkService.getExpenseReport(statusData.reportIds.expenseReportId!);
        const riskResult = await this.tinkService.getRiskInsights(statusData.reportIds.riskInsightsReportId!);

        if (incomeResult.isFail || expenseResult.isFail || riskResult.isFail) {
          return Result.fail(new Error('Failed to retrieve bank data'));
        }

        connection.markDataRetrieved();
        await this.repository.update(connection);

        this.logger.info('Bank data retrieved', { connectionId, customerId: connection.customerId });

        return Result.ok({
          status: 'COMPLETED',
          isReady: true,
          data: {
            income: incomeResult.getOrThrow(),
            expense: expenseResult.getOrThrow(),
            risk: riskResult.getOrThrow(),
          },
        });
      }

      if (statusData.status === 'FAILED') {
        return Result.fail(new Error(`Report generation failed: ${statusData.errorDetails}`));
      }

      return Result.ok({
        status: 'PENDING',
        isReady: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Poll failed', { connectionId, error: message });
      return Result.fail(new Error(`Poll failed: ${message}`));
    }
  }
}
