import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/result';
import type { IBankConnectionRepository } from '../../domain/bank-connection/IBankConnectionRepository';
import type { ILogger } from '../../shared/logging';
import type { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';
import { BankDataExtractionService, IncomeBreakdown, ExpenseBreakdown } from '../../infrastructure/services/BankDataExtractionService';
import { Assessment } from '../../domain/entities/Assessment.entity';
import type { IJobDispatcher } from '../jobs/IJobDispatcher';

export class HandleBankOAuthCallbackUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private tinkService: TinkOAuthService,
    private prisma: PrismaClient,
    private logger: ILogger,
    private jobDispatcher: IJobDispatcher,
  ) { }

  async execute(
    code: string,
    state: string
  ): Promise<
    Result<
      {
        connectionId: string;
        totalExpenses: number;
        totalIncome: number;
        assessmentId: string;
        incomeBreakdown: IncomeBreakdown;
        expenseBreakdown: ExpenseBreakdown;
      },
      Error
    >
  > {
    try {
      const connResult = await this.repository.findByOAuthState(state);
      if (connResult.isFail) {
        return Result.fail(connResult.getError() || new Error('Unknown error'));
      }

      const connection = connResult.getOrThrow();
      if (!connection) {
        return Result.fail(new Error('Invalid OAuth state token'));
      }

      const customer = await this.prisma.customer.findUnique({
        where: { id: connection.customerId },
      });
      if (!customer) {
        return Result.fail(new Error('Customer not found'));
      }

      // Get access token for API requests
      const tokenResult = await this.tinkService.exchangeCodeForAccessToken();
      if (tokenResult.isFail) {
        return Result.fail(tokenResult.getError() || new Error('Unknown error'));
      }

      //updated
      const accessToken = tokenResult.getOrThrow();

      // Fetch both income and expense check data
      const incomeResult = await this.tinkService.getIncomeReport(code);
      if (incomeResult.isFail) {
        return Result.fail(incomeResult.getError() || new Error('Failed to fetch income data'));
      }

      const expenseResult = await this.tinkService.getExpenseCheck(code, accessToken);
      if (expenseResult.isFail) {
        return Result.fail(expenseResult.getError() || new Error('Failed to fetch expense data'));
      }

      const incomeData = incomeResult.getOrThrow();
      const expenseData = expenseResult.getOrThrow();

      // Extract key figures
      const extractedIncomeResult = BankDataExtractionService.extractIncome(incomeData);
      if (extractedIncomeResult.isFail) {
        return Result.fail(
          extractedIncomeResult.getError() || new Error('Failed to extract income figures')
        );
      }

      const extractedExpenseResult = BankDataExtractionService.extractExpenses(expenseData);
      if (extractedExpenseResult.isFail) {
        return Result.fail(
          extractedExpenseResult.getError() || new Error('Failed to extract expense figures')
        );
      }

      const income = extractedIncomeResult.getOrThrow();
      const expenses = extractedExpenseResult.getOrThrow();

      // Save raw JSONs to BankReports table
      await this.prisma.bankReports.upsert({
        where: { bankConnectionId: connection.id },
        update: {
          incomeJson: JSON.stringify(incomeData),
          expensesJson: JSON.stringify(expenseData),
          totalMonthlyIncome: income.total,
          totalMonthlyExpenses: expenses.total,
          createdAt: new Date(),
        },
        create: {
          bankConnectionId: connection.id,
          incomeJson: JSON.stringify(incomeData),
          expensesJson: JSON.stringify(expenseData),
          totalMonthlyIncome: income.total,
          totalMonthlyExpenses: expenses.total,
        },
      });

      // Create Assessment record with status PENDING
      const assessment = Assessment.create({
        customerId: connection.customerId,
        bankConnectionId: connection.id,
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
        monthlyBill: customer.monthlyBill ?? 0,
        arrears: customer.arrears ?? null,
        status: 'PENDING',
        id: '', // Will be overridden
      });

      // Generate ID before saving
      const { id: assessmentId } = await this.prisma.assessment.create({
        data: {
          customerId: assessment.getCustomerId(),
          bankConnectionId: assessment.getBankConnectionId(),
          monthlyIncome: assessment.getMonthlyIncome(),
          monthlyExpenses: assessment.getMonthlyExpenses(),
          monthlyBill: assessment.getMonthlyBill(),
          arrears: assessment.getArrears(),
          status: 'PENDING',
        },
      });

      // Create AssessmentJob record
      const { id: jobId } = await this.prisma.assessmentJob.create({
        data: {
          assessmentId,
          status: 'PENDING',
        },
      });

      // Mark connection as data retrieved
      connection.markDataRetrieved();
      const updateResult = await this.repository.update(connection);
      if (updateResult.isFail) {
        return Result.fail(
          updateResult.getError() || new Error('Failed to update bank connection')
        );
      }

      // Dispatch job for background processing — returns immediately
      await this.jobDispatcher.dispatch(jobId);

      this.logger.info('OAuth callback handled and assessment created', {
        connectionId: connection.id,
        customerId: connection.customerId,
        assessmentId,
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
      });

      return Result.ok({
        connectionId: connection.id,
        totalExpenses: expenses.total,
        totalIncome: income.total,
        assessmentId,
        incomeBreakdown: income,
        expenseBreakdown: expenses,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth callback failed', { error: message });
      return Result.fail(new Error(`OAuth callback failed: ${message}`));
    }
  }
}
