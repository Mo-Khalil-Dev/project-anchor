import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/result';
import { Assessment, type IAssessmentRepository } from '../types/assessment.types';

export class PrismaAssessmentRepository implements IAssessmentRepository {
  constructor(private prisma: PrismaClient) {}

  async save(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const created = await this.prisma.assessment.create({
        data: {
          id: assessment.getId(),
          customerId: assessment.getCustomerId(),
          bankConnectionId: assessment.getBankConnectionId(),
          monthlyIncome: assessment.getMonthlyIncome(),
          monthlyExpenses: assessment.getMonthlyExpenses(),
          monthlyBill: assessment.getMonthlyBill(),
          arrears: assessment.getArrears(),
          disposableIncome: assessment.calculateDisposableIncome(),
          billRatio: assessment.calculateBillRatio(),
          hardshipLevel: assessment.getHardshipLevel(),
          sustainabilityScore: assessment.getSustainabilityScore(),
          status: assessment.getStatus(),
          incomeBreakdown: null,
          expenseBreakdown: null,
          createdAt: assessment.getCreatedAt(),
          updatedAt: assessment.getUpdatedAt(),
        },
      });

      return Result.ok(this.toDomain(created));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save assessment';
      return Result.fail(new Error(`Assessment save failed: ${message}`));
    }
  }

  async findById(id: string): Promise<Result<Assessment | null, Error>> {
    try {
      const record = await this.prisma.assessment.findUnique({
        where: { id },
      });

      if (!record) {
        return Result.ok(null);
      }

      return Result.ok(this.toDomain(record));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find assessment';
      return Result.fail(new Error(`Assessment lookup failed: ${message}`));
    }
  }

  async findByCustomerId(customerId: string): Promise<Result<Assessment[], Error>> {
    try {
      const records = await this.prisma.assessment.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      const assessments = records.map(record => this.toDomain(record));
      return Result.ok(assessments);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find assessments';
      return Result.fail(new Error(`Assessment lookup failed: ${message}`));
    }
  }

  async update(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const updated = await this.prisma.assessment.update({
        where: { id: assessment.getId() },
        data: {
          bankConnectionId: assessment.getBankConnectionId(),
          monthlyIncome: assessment.getMonthlyIncome(),
          monthlyExpenses: assessment.getMonthlyExpenses(),
          monthlyBill: assessment.getMonthlyBill(),
          arrears: assessment.getArrears(),
          disposableIncome: assessment.calculateDisposableIncome(),
          billRatio: assessment.calculateBillRatio(),
          hardshipLevel: assessment.getHardshipLevel(),
          sustainabilityScore: assessment.getSustainabilityScore(),
          incomeBreakdown: assessment.getIncomeBreakdown(),
          expenseBreakdown: assessment.getExpenseBreakdown(),
          status: assessment.getStatus(),
          updatedAt: new Date(),
        },
      });

      return Result.ok(this.toDomain(updated));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update assessment';
      return Result.fail(new Error(`Assessment update failed: ${message}`));
    }
  }

  private toDomain(record: any): Assessment {
    return new Assessment({
      id: record.id,
      customerId: record.customerId,
      bankConnectionId: record.bankConnectionId,
      monthlyIncome: record.monthlyIncome,
      monthlyExpenses: record.monthlyExpenses,
      monthlyBill: record.monthlyBill,
      arrears: record.arrears,
      incomeBreakdown: record.incomeBreakdown,
      expenseBreakdown: record.expenseBreakdown,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
