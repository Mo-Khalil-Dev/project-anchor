import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import type { AssessmentData } from './GetAssessmentQuery.dto';
import type { ApplicationError } from '../../../../core/domain/errors';
import { AssessmentMapper } from '../../../assessment/infrastructure/mappers';
import {
  AssessmentRepositoryQueryError,
  GetAssessmentQueryExecutionError,
} from '@/features/assessment/application/errors/GetAssessmentQuery.errors';

export class GetAssessmentQuery {
  private assessmentMapper: AssessmentMapper;

  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger
  ) {
    this.assessmentMapper = new AssessmentMapper(logger);
  }

  async execute(input: {
    customerId: string;
  }): Promise<Result<AssessmentData | null, ApplicationError>> {
    try {
      const { customerId } = input;

      const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);

      if (assessmentResult.isFail) {
        const repositoryError = assessmentResult.getError();
        this.logger.error('Failed to fetch referenceData', {
          customerId,
          error: repositoryError,
        });
        return Result.fail(new AssessmentRepositoryQueryError(customerId, repositoryError));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (!assessment) {
        return Result.ok<AssessmentData | null>(null) as Result<
          AssessmentData | null,
          ApplicationError
        >;
      }

      const assessmentData = this.assessmentMapper.toDTO(assessment, customerId);

      return Result.ok<AssessmentData | null>(assessmentData) as Result<
        AssessmentData | null,
        ApplicationError
      >;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetAssessment query failed', {
        error: message,
      });
      return Result.fail(new GetAssessmentQueryExecutionError(error));
    }
  }
}
