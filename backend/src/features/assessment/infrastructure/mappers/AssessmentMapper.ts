import type { Assessment as PrismaAssessment } from '@prisma/client';
import { Assessment } from '@/features/assessment/domain/entities/assessment.entity';
import type { AssessmentProps } from '@/features/assessment/domain/entities/assessment-props';
import type { AssessmentData } from '../../../referenceData/application/useCases/GetAssessmentQuery.dto';
import { AssessmentBreakdownParser } from '@/features/assessment/application/services/AssessmentBreakdownParser';
import type { ILogger } from '../../../shared/logging';

export class AssessmentMapper {
  private breakdownParser: AssessmentBreakdownParser;

  constructor(logger: ILogger) {
    this.breakdownParser = new AssessmentBreakdownParser(logger);
  }

  toDomain(record: PrismaAssessment): Assessment {
    const props: AssessmentProps = {
      id: record.id,
      customerId: record.customerId,
      bankConnectionId: record.bankConnectionId ?? undefined,
      monthlyIncome: record.monthlyIncome ?? 0,
      monthlyExpenses: record.monthlyExpenses ?? 0,
      monthlyBill: record.monthlyBill ?? 0,
      arrears: record.arrears ?? undefined,
      incomeBreakdown: record.incomeBreakdown ?? undefined,
      expenseBreakdown: record.expenseBreakdown ?? undefined,
      expensesByCategory: record.expensesByCategory ?? undefined,
      incomeHistory: record.incomeHistory ?? undefined,
      incomeSources: record.incomeSources ?? undefined,
      factors: record.factors ?? undefined,
      paymentPlans: record.paymentPlans ?? undefined,
      selectedPlan: (record.selectedPlan as any) ?? null,
      status: record.status as any,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Assessment.reconstruct(props);
  }

  toPersistence(assessment: Assessment): Record<string, unknown> {
    return {
      id: assessment.getId(),
      customerId: assessment.getCustomerId(),
      bankConnectionId: assessment.getBankConnectionId(),
      monthlyIncome: assessment.getMonthlyIncome(),
      monthlyExpenses: assessment.getMonthlyExpenses(),
      monthlyBill: assessment.getMonthlyBill(),
      arrears: assessment.getArrears(),
      incomeBreakdown: assessment.getIncomeBreakdown(),
      expenseBreakdown: assessment.getExpenseBreakdown(),
      expensesByCategory: assessment.getExpensesByCategory(),
      incomeHistory: assessment.getIncomeHistory(),
      incomeSources: assessment.getIncomeSources(),
      factors: assessment.getFactors(),
      paymentPlans: assessment.getPaymentPlans(),
      selectedPlan: assessment.getSelectedPlan(),
      status: assessment.getStatus(),
      createdAt: assessment.getCreatedAt(),
      updatedAt: assessment.getUpdatedAt(),
    };
  }

  toDTO(assessment: Assessment, customerId: string): AssessmentData {
    return {
      id: assessment.getId(),
      status:
        assessment.getStatus() === 'COMPLETED'
          ? 'COMPLETED'
          : assessment.getStatus() === 'PENDING'
            ? 'PENDING'
            : 'IN_PROGRESS',
      hardshipLevel: assessment.getHardshipLevel(),
      disposableIncome: assessment.calculateDisposableIncome(),
      monthlyBill: assessment.getMonthlyBill(),
      billRatio: assessment.calculateBillRatio(),
      monthlyIncome: assessment.getMonthlyIncome(),
      monthlyExpenses: assessment.getMonthlyExpenses(),
      expensesByCategory: this.breakdownParser.parseExpensesByCategory(
        assessment.getExpensesByCategory(),
        customerId
      ),
      incomeSources: this.breakdownParser.parseIncomeSources(
        assessment.getIncomeSources(),
        customerId
      ),
      incomeHistory: this.breakdownParser.parseIncomeHistory(
        assessment.getIncomeHistory(),
        customerId
      ),
      factors: this.breakdownParser.parseAssessmentFactors(assessment.getFactors(), customerId),
      paymentPlans: this.breakdownParser.parsePaymentPlans(
        assessment.getPaymentPlans(),
        customerId
      ),
      createdAt: assessment.getCreatedAt().toISOString(),
    };
  }
}
