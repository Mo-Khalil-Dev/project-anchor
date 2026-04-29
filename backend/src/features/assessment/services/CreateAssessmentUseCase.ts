import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { IAssessmentRepository } from '../types/assessment.types';
import { Assessment } from '../types/assessment.types';
import { PaymentPlanCalculationService } from './PaymentPlanCalculationService';

export interface CreateAssessmentInput {
  customerId: string;
  bankConnectionId?: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBill: number;
  arrears?: number;
  incomeBreakdown?: Record<string, number>;
  expenseBreakdown?: Record<string, number>;
  expensesByCategory?: Record<string, number>;
  incomeHistory?: Array<{ month: string; amount: number }>;
  incomeSources?: Array<{ type: string; amount: number; frequency: string }>;
  factors?: Array<{ title: string; description: string }>;
}

export interface CreateAssessmentOutput {
  id: string;
  customerId: string;
  disposableIncome: number;
  billRatio: number;
  hardshipLevel: string;
  sustainabilityScore: string;
  status: string;
}

/**
 * CreateAssessmentUseCase
 *
 * Creates a new assessment for a customer with:
 * 1. Calculated disposable income and bill ratio
 * 2. Hardship level determination
 * 3. Payment plan calculation (Conservative, Balanced, Aggressive)
 * 4. Breakdown data storage (expenses, income, factors)
 */
export class CreateAssessmentUseCase {
  private paymentPlanService = new PaymentPlanCalculationService();

  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
  ) {}

  async execute(input: CreateAssessmentInput): Promise<Result<CreateAssessmentOutput, Error>> {
    try {
      // Validate inputs
      if (!input.customerId || input.monthlyIncome < 0 || input.monthlyExpenses < 0 || input.monthlyBill < 0) {
        return Result.fail(new Error('Invalid assessment input data'));
      }

      // Calculate payment plans first (needed before creating entity)
      const disposableIncome = input.monthlyIncome - input.monthlyExpenses;
      const paymentPlans = this.paymentPlanService.calculatePlans(
        disposableIncome,
        input.arrears || 0,
      );

      // Create assessment entity with all JSON fields
      const assessment = Assessment.create({
        id: this.generateId(),
        customerId: input.customerId,
        bankConnectionId: input.bankConnectionId,
        monthlyIncome: input.monthlyIncome,
        monthlyExpenses: input.monthlyExpenses,
        monthlyBill: input.monthlyBill,
        arrears: input.arrears || 0,
        incomeBreakdown: input.incomeBreakdown ? JSON.stringify(input.incomeBreakdown) : null,
        expenseBreakdown: input.expenseBreakdown ? JSON.stringify(input.expenseBreakdown) : null,
        expensesByCategory: input.expensesByCategory ? JSON.stringify(input.expensesByCategory) : null,
        incomeHistory: input.incomeHistory ? JSON.stringify(input.incomeHistory) : null,
        incomeSources: input.incomeSources ? JSON.stringify(input.incomeSources) : null,
        factors: input.factors ? JSON.stringify(input.factors) : null,
        paymentPlans: JSON.stringify(paymentPlans),
        status: 'COMPLETED',
      });

      // Save assessment to repository
      const saveResult = await this.assessmentRepository.save(assessment);

      if (saveResult.isFail) {
        this.logger.error('Failed to save assessment', {
          customerId: input.customerId,
          error: saveResult.getError()?.message,
        });
        return Result.fail(new Error('Failed to create assessment'));
      }

      const savedAssessment = saveResult.getOrThrow();

      this.logger.info('Assessment created successfully', {
        customerId: input.customerId,
        assessmentId: savedAssessment.getId(),
        disposableIncome,
        hardshipLevel: savedAssessment.getHardshipLevel(),
      });

      return Result.ok({
        id: savedAssessment.getId(),
        customerId: savedAssessment.getCustomerId(),
        disposableIncome,
        billRatio: savedAssessment.calculateBillRatio(),
        hardshipLevel: savedAssessment.getHardshipLevel(),
        sustainabilityScore: savedAssessment.getSustainabilityScore(),
        status: savedAssessment.getStatus(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('CreateAssessment use case error', { error: message });
      return Result.fail(new Error(`Failed to create assessment: ${message}`));
    }
  }

  private generateId(): string {
    // Simple ID generation; in production use a proper UUID library
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
