import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import type { SelectPlanInput, SelectPlanOutput } from './SelectPlan.dto';
import { PLAN_TYPE } from '@/features/assessment/domain/entities/plan-type';
import { PaymentPlanSelectedEvent } from '@/features/assessment/domain/events';
import { ICustomerRepository } from '@/features/customer/application/repository/ICustomerRepository';

const VALID_PLAN_TYPES = Object.values(PLAN_TYPE);

/**
 * SelectPlanUseCase
 *
 * Persists the customer's chosen payment plan on their latest assessment.
 * Called from the T&C screen when the customer accepts the plan.
 *
 * Flow:
 *   1. Resolve userId → customerId via customer repository
 *   2. Find the latest assessment for that customer
 *   3. Validate that the planType matches one of the calculated plans
 *   4. Update assessment.selectedPlan
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
    const paymentPlans = assessment.getPaymentPlans();
    if (!paymentPlans || paymentPlans.length === 0) {
      return Result.fail(new Error('Assessment has no payment plans'));
    }

    const planExists = paymentPlans.some((p) => p.type === planType);
    if (!planExists) {
      return Result.fail(new Error(`Plan type ${planType} not available for this assessment`));
    }

    // Call domain mutation method (records PaymentPlanSelectedEvent internally)
    assessment.selectPaymentPlan(planType);

    // Handle domain events
    const domainEvents = assessment.getDomainEvents();
    for (const event of domainEvents) {
      if (event instanceof PaymentPlanSelectedEvent) {
        this.logger.info('Payment plan selected by customer', {
          userId,
          customerId,
          assessmentId: assessment.getId(),
          planType: event.payload.planType,
        });
      }
    }
    assessment.clearDomainEvents();

    // Persist changes
    const updateResult = await this.assessmentRepository.update(assessment);
    if (updateResult.isFail) {
      this.logger.error('Failed to save plan selection', {
        userId,
        assessmentId: assessment.getId(),
        planType,
      });
      return Result.fail(new Error('Failed to save plan selection'));
    }

    return Result.ok({
      assessmentId: assessment.getId(),
      selectedPlan: planType,
    });
  }
}
