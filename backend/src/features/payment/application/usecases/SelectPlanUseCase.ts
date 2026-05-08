import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import type { ICustomerRepository } from '../../../customer/types/customer.types';
import type { SelectPlanInput, SelectPlanOutput, PlanType } from '../../types/payment.types';

const VALID_PLAN_TYPES: PlanType[] = ['Conservative', 'Balanced', 'Aggressive'];

/**
 * SelectPlanUseCase
 *
 * Persists the customer's chosen payment plan on their latest referenceData.
 * Called from the T&C screen when the customer accepts the plan.
 *
 * Flow:
 *   1. Resolve userId → customerId via Users table
 *   2. Find the latest referenceData for that customer
 *   3. Validate that the planType matches one of the calculated plans
 *   4. Update referenceData.selectedPlan
 */
export class SelectPlanUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private customerRepository: ICustomerRepository,
    private logger: ILogger
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

    // Find latest referenceData
    const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);
    if (assessmentResult.isFail) {
      this.logger.error('Failed to fetch latest referenceData', { userId, customerId });
      return Result.fail(new Error('Failed to fetch referenceData'));
    }

    const assessment = assessmentResult.getOrElse(null);
    if (!assessment) {
      return Result.fail(new Error('No referenceData found for customer'));
    }

    // Validate plan exists in the referenceData's calculated plans
    const paymentPlans = assessment.getPaymentPlans();
    if (!paymentPlans || paymentPlans.length === 0) {
      return Result.fail(new Error('Assessment has no payment plans'));
    }

    const planExists = paymentPlans.some((p) => p.type === planType);
    if (!planExists) {
      return Result.fail(new Error(`Plan type ${planType} not available for this assessment`));
    }

    // Persist selection
    const updateResult = await this.assessmentRepository.updateSelectedPlan(
      assessment.getId(),
      planType
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
