import { PrismaClient } from '@prisma/client';
import { Result } from '@/features/shared/result';
import type {
  IBankReportRepository,
  BankReportData,
} from '../../../bankConnection/application/repositories/IBankReportRepository';

export class PrismaBankReportRepository implements IBankReportRepository {
  constructor(private prisma: PrismaClient) {}

  async findByBankConnectionId(
    bankConnectionId: string
  ): Promise<Result<BankReportData | null, Error>> {
    try {
      const bankReport = await this.prisma.bankReports.findUnique({
        where: { bankConnectionId },
      });

      if (!bankReport) {
        return Result.ok(null);
      }

      return Result.ok({
        id: bankReport.id,
        bankConnectionId: bankReport.bankConnectionId,
        incomeJson: bankReport.incomeJson,
        expensesJson: bankReport.expensesJson,
        totalMonthlyIncome: bankReport.totalMonthlyIncome,
        totalMonthlyExpenses: bankReport.totalMonthlyExpenses,
        createdAt: bankReport.createdAt,
        expiresAt: bankReport.expiresAt,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to fetch bank report'));
    }
  }

  async save(
    bankConnectionId: string,
    data: Omit<BankReportData, 'id' | 'createdAt'>
  ): Promise<Result<BankReportData, Error>> {
    try {
      const bankReport = await this.prisma.bankReports.upsert({
        where: { bankConnectionId },
        update: {
          incomeJson: data.incomeJson,
          expensesJson: data.expensesJson,
          totalMonthlyIncome: data.totalMonthlyIncome,
          totalMonthlyExpenses: data.totalMonthlyExpenses,
          expiresAt: data.expiresAt,
        },
        create: {
          bankConnectionId,
          incomeJson: data.incomeJson,
          expensesJson: data.expensesJson,
          totalMonthlyIncome: data.totalMonthlyIncome,
          totalMonthlyExpenses: data.totalMonthlyExpenses,
          expiresAt: data.expiresAt,
        },
      });

      return Result.ok({
        id: bankReport.id,
        bankConnectionId: bankReport.bankConnectionId,
        incomeJson: bankReport.incomeJson,
        expensesJson: bankReport.expensesJson,
        totalMonthlyIncome: bankReport.totalMonthlyIncome,
        totalMonthlyExpenses: bankReport.totalMonthlyExpenses,
        createdAt: bankReport.createdAt,
        expiresAt: bankReport.expiresAt,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to save bank report'));
    }
  }

  async findByBankConnectionIdOrThrow(bankConnectionId: string): Promise<BankReportData> {
    const bankReport = await this.prisma.bankReports.findUnique({
      where: { bankConnectionId },
    });

    if (!bankReport) {
      throw new Error('Bank report not found');
    }

    return {
      id: bankReport.id,
      bankConnectionId: bankReport.bankConnectionId,
      incomeJson: bankReport.incomeJson,
      expensesJson: bankReport.expensesJson,
      totalMonthlyIncome: bankReport.totalMonthlyIncome,
      totalMonthlyExpenses: bankReport.totalMonthlyExpenses,
      createdAt: bankReport.createdAt,
      expiresAt: bankReport.expiresAt,
    };
  }
}
