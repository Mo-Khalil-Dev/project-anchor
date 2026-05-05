import { Result } from '../../shared/result';
import { Assessment, type IAssessmentRepository, type PlanType } from '../domain/entities';
import { prisma } from '../../shared/utils/db';


export class PrismaAssessmentRepository implements IAssessmentRepository {

  async save(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const created = await prisma.assessment.create({
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
          incomeBreakdown: assessment.getIncomeBreakdown(),
          expenseBreakdown: assessment.getExpenseBreakdown(),
          expensesByCategory: assessment.getExpensesByCategory(),
          incomeHistory: assessment.getIncomeHistory(),
          incomeSources: assessment.getIncomeSources(),
          factors: assessment.getFactors(),
          paymentPlans: assessment.getPaymentPlans(),
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
      const record = await prisma.assessment.findUnique({
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
      const records = await prisma.assessment.findMany({
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

  async findLatestByCustomerId(customerId: string): Promise<Result<Assessment | null, Error>> {
    try {
      const record = await prisma.assessment.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
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

  async update(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const updated = await prisma.assessment.update({
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
          expensesByCategory: assessment.getExpensesByCategory(),
          incomeHistory: assessment.getIncomeHistory(),
          incomeSources: assessment.getIncomeSources(),
          factors: assessment.getFactors(),
          paymentPlans: assessment.getPaymentPlans(),
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

  async updateSelectedPlan(assessmentId: string, planType: PlanType): Promise<Result<void, Error>> {
    try {
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          selectedPlan: planType,
          updatedAt: new Date(),
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update selected plan';
      return Result.fail(new Error(`Selected plan update failed: ${message}`));
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
      expensesByCategory: record.expensesByCategory,
      incomeHistory: record.incomeHistory,
      incomeSources: record.incomeSources,
      factors: record.factors,
      paymentPlans: record.paymentPlans,
      selectedPlan: record.selectedPlan,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
