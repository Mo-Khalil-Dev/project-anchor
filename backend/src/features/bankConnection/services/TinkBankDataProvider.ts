import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { TinkGateway } from './TinkGateway';
import { BankDataExtractionService } from './BankDataExtractionService';
import type { IBankDataProvider, BankFinancialData } from './IBankDataProvider';

export class TinkBankDataProvider implements IBankDataProvider {
  constructor(
    private tink: TinkGateway,
    private logger: ILogger,
  ) {}

  async fetchFinancialData(code: string): Promise<Result<BankFinancialData, Error>> {
    const tokenResult = await this.tink.exchangeCodeForAccessToken();
    if (tokenResult.isFail) {
      this.logger.error('Failed to exchange OAuth code', { error: tokenResult.getError()?.message });
      return Result.fail(tokenResult.getError()!);
    }
    const accessToken = tokenResult.getOrThrow();

    const incomeResult = await this.tink.getIncomeReport(code);
    if (incomeResult.isFail) {
      this.logger.error('Failed to fetch income report', { error: incomeResult.getError()?.message });
      return Result.fail(incomeResult.getError()!);
    }

    const expenseResult = await this.tink.getExpenseCheck(code, accessToken);
    if (expenseResult.isFail) {
      this.logger.error('Failed to fetch expense check', { error: expenseResult.getError()?.message });
      return Result.fail(expenseResult.getError()!);
    }

    const rawIncomeData = incomeResult.getOrThrow();
    const rawExpenseData = expenseResult.getOrThrow();

    const extractedIncome = BankDataExtractionService.extractIncome(rawIncomeData);
    if (extractedIncome.isFail) {
      this.logger.error('Failed to extract income figures', { error: extractedIncome.getError()?.message });
      return Result.fail(extractedIncome.getError()!);
    }

    const extractedExpenses = BankDataExtractionService.extractExpenses(rawExpenseData);
    if (extractedExpenses.isFail) {
      this.logger.error('Failed to extract expense figures', { error: extractedExpenses.getError()?.message });
      return Result.fail(extractedExpenses.getError()!);
    }

    return Result.ok({
      income: extractedIncome.getOrThrow(),
      expenses: extractedExpenses.getOrThrow(),
      rawIncomeData,
      rawExpenseData,
    });
  }
}
