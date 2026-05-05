import type { ILogger } from '../../../shared/logging';
import type { IncomeRecord, IncomeSource, AssessmentFactor, PaymentPlan } from '../useCases/GetAssessmentQuery.dto';

export class AssessmentBreakdownParser {
  constructor(private logger: ILogger) {}

  parseExpensesByCategory(jsonString: string | null, customerId: string): Record<string, number> {
    if (!jsonString) {
      return {};
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      this.logger.warn('Failed to parse expensesByCategory', { customerId });
      return {};
    }
  }

  parseIncomeSources(jsonString: string | null, customerId: string): IncomeSource[] {
    if (!jsonString) {
      return [];
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      this.logger.warn('Failed to parse incomeSources', { customerId });
      return [];
    }
  }

  parseIncomeHistory(jsonString: string | null, customerId: string): IncomeRecord[] {
    if (!jsonString) {
      return [];
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      this.logger.warn('Failed to parse incomeHistory', { customerId });
      return [];
    }
  }

  parseAssessmentFactors(jsonString: string | null, customerId: string): AssessmentFactor[] {
    if (!jsonString) {
      return [];
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      this.logger.warn('Failed to parse factors', { customerId });
      return [];
    }
  }

  parsePaymentPlans(jsonString: string | null, customerId: string): PaymentPlan[] {
    if (!jsonString) {
      return [];
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      this.logger.warn('Failed to parse suggestedPaymentPlans', { customerId });
      return [];
    }
  }
}
