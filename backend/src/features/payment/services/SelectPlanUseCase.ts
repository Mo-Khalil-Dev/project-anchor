import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { IAssessmentRepository } from '../../assessment/types/assessment.types';
import type { ICustomerRepository } from '../../customer/types/customer.types';
import type { SelectPlanInput, SelectPlanOutput, PlanType } from '../types/payment.types';

const VALID_PLAN_TYPES: PlanType[] = ['Conservative', 'Balanced', 'Aggressive'];

/**
 * SelectPlanUseCase
 *
 * Persists the customer's chosen payment plan on their latest assessment.
 * Called from the T&C screen when the customer accepts the plan.
 *
 * Flow:
 *   1. Resolve userId → customerId via Users table
 *   2. Find the latest assessment for that customer
 *   3. Validate that the planType matches one of the calculated plans
 *   4. Update assessment.selectedPlan
 */
export class SelectPlanUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private customerRepository: ICustomerRepository,
    private logger: ILogger,
  ) {}

  async execute(input: SelectPlanInput): Promise<Result<SelectPlanOutput, Error>> {
    const { userId, planType } = input;

    if (!userId) {
      return Result.fail(new Error('User ID is required'));
    }

    if (!VALID_PLAN_TYPES.includes(planType)) {
      return Result.fail(new Error(`Invalid plan type: ${planType}`));
    }

    // Resolve customerId from userId
    const customerIdResult = await this.customerRepository.findCustomerIdByUserId(userId);
    if (customerIdResult.isFail) {
      this.logger.error('Failed to resolve customerId from userId', { userId });
      return Result.fail(new Error('Failed to resolve customer'));
    }

    const customerId = customerIdResult.getOrElse(null);
    if (!customerId) {
      return Result.fail(new Error('Customer not linked to user'));
    }

    // Find latest assessment
    const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);
    if (assessmentResult.isFail) {
      this.logger.error('Failed to fetch latest assessment', { userId, customerId });
      return Result.fail(new Error('Failed to fetch assessment'));
    }

    const assessment = assessmentResult.getOrElse(null);
    if (!assessment) {
      return Result.fail(new Error('No assessment found for customer'));
    }

    // Validate plan exists in the assessment's calculated plans
    const paymentPlansJson = assessment.getPaymentPlans();
    if (!paymentPlansJson) {
      return Result.fail(new Error('Assessment has no payment plans'));
    }

    let plans: Array<{ type: string }>;
    try {
      plans = JSON.parse(paymentPlansJson);
    } catch {
      return Result.fail(new Error('Invalid payment plans JSON'));
    }

    const planExists = plans.some(p => p.type === planType);
    if (!planExists) {
      return Result.fail(new Error(`Plan type ${planType} not available for this assessment`));
    }

    // Persist selection
    const updateResult = await this.assessmentRepository.updateSelectedPlan(
      assessment.getId(),
      planType,
    );
    if (updateResult.isFail) {
      this.logger.error('Failed to update selected plan', {
        userId,
        assessmentId: assessment.getId(),
        planType,
      });
      return Result.fail(new Error('Failed to save plan selection'));
    }

    this.logger.info('Plan selected by customer', {
      userId,
      customerId,
      assessmentId: assessment.getId(),
      planType,
    });

    return Result.ok({
      assessmentId: assessment.getId(),
      selectedPlan: planType,
    });
  }
}
