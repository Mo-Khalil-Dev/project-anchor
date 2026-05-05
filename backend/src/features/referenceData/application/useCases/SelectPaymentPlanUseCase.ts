import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '../../domain/entities';
import type { ApplicationError } from '../../../../core/domain/errors';
import type { SelectPaymentPlanInput, SelectPaymentPlanOutput } from './SelectPaymentPlanUseCase.dto';
import {
  AssessmentNotFoundError as SelectPaymentPlanNotFoundError,
  SelectPaymentPlanExecutionError,
  InvalidPlanTypeError,
} from '../errors/SelectPaymentPlanUseCase.errors';
import { PaymentPlanSelectedEvent } from '../../domain/events';

const VALID_PLAN_TYPES = ['Conservative', 'Balanced', 'Aggressive'] as const;

export class SelectPaymentPlanUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
  ) {}

  async execute(input: SelectPaymentPlanInput): Promise<Result<SelectPaymentPlanOutput, ApplicationError>> {
    try {
      const { assessmentId, planType } = input;

      // Validate plan type
      if (!VALID_PLAN_TYPES.includes(planType)) {
        this.logger.warn('Invalid plan type provided', { assessmentId, planType });
        return Result.fail(new InvalidPlanTypeError(planType));
      }

      // Load assessment from repository
      const assessmentResult = await this.assessmentRepository.findById(assessmentId);

      if (assessmentResult.isFail) {
        const repositoryError = assessmentResult.getError();
        this.logger.error('Failed to fetch assessment for plan selection', {
          assessmentId,
          error: repositoryError,
        });
        return Result.fail(new SelectPaymentPlanNotFoundError(assessmentId, repositoryError));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (!assessment) {
        this.logger.warn('Assessment not found', { assessmentId });
        return Result.fail(new SelectPaymentPlanNotFoundError(assessmentId));
      }

      // Call mutation method (records PaymentPlanSelectedEvent internally)
      assessment.selectPaymentPlan(planType);

      // Handle domain events
      const domainEvents = assessment.getDomainEvents();
      const selectedAt = new Date();
      for (const event of domainEvents) {
        if (event instanceof PaymentPlanSelectedEvent) {
          this.logger.info('Payment plan selected', {
            assessmentId,
            planType: event.payload.planType,
          });
        }
      }
      assessment.clearDomainEvents();

      // Persist changes
      const updateResult = await this.assessmentRepository.update(assessment);

      if (updateResult.isFail) {
        const persistError = updateResult.getError();
        this.logger.error('Failed to save payment plan selection', {
          assessmentId,
          error: persistError,
        });
        return Result.fail(new SelectPaymentPlanExecutionError('Failed to persist assessment', persistError)) as Result<
          SelectPaymentPlanOutput,
          ApplicationError
        >;
      }

      // Return output DTO
      const output: SelectPaymentPlanOutput = {
        assessmentId: assessment.getId(),
        selectedPlan: planType,
        selectedAt: selectedAt.toISOString(),
      };
      return Result.ok(output) as Result<SelectPaymentPlanOutput, ApplicationError>;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('SelectPaymentPlan use case failed', { error: message });
      return Result.fail(new SelectPaymentPlanExecutionError('Unexpected error during plan selection', error));
    }
  }
}
