import { Assessment } from '../../domain/entities/Assessment.entity';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { AssessmentDomainService } from '../../domain/services/AssessmentDomainService';
import { CreateAssessmentRequest, CreateAssessmentResponse } from '../dtos/assessment.dtos';
import { AssessmentMapper } from '../mappers/AssessmentMapper';
import { DomainError } from '../../domain/errors/DomainError';
import { logger } from '../../utils/logger';

/**
 * Create Assessment Use Case
 *
 * Orchestrates the workflow for creating a new assessment:
 * 1. Validate input
 * 2. Check for duplicates
 * 3. Create domain entity (which calculates hardship)
 * 4. Save to repository
 * 5. Return result
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles assessment creation flow
 * - Open/Closed: New business rules can be added via service
 * - Liskov Substitution: Consistent behavior from dependencies
 * - Interface Segregation: Depends only on needed abstractions
 * - Dependency Inversion: Injects dependencies, doesn't create them
 */
export class CreateAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly assessmentDomainService: AssessmentDomainService
  ) {}

  async execute(input: CreateAssessmentRequest): Promise<CreateAssessmentResponse> {
    try {
      // Step 1: Validate input
      const validatedInput = AssessmentMapper.validateCreateRequest(input);
      logger.info('Assessment creation requested', {
        customerId: validatedInput.customerId,
        monthlyIncome: validatedInput.monthlyIncome,
        billAmount: validatedInput.billAmount,
      });

      // Step 2: Check for recent duplicate assessments
      try {
        await this.assessmentDomainService.validateNoDuplicateAssessment(validatedInput.customerId);
      } catch (error) {
        if (error instanceof DomainError) {
          logger.warn('Duplicate assessment blocked', {
            customerId: validatedInput.customerId,
            reason: error.message,
          });
          throw error;
        }
      }

      // Step 3: Create domain entity (includes hardship calculation)
      const assessment = Assessment.create({
        customerId: validatedInput.customerId,
        monthlyIncome: validatedInput.monthlyIncome,
        totalExpenses: validatedInput.totalExpenses,
        billAmount: validatedInput.billAmount,
        arrears: validatedInput.arrears,
        vulnerabilities: validatedInput.vulnerabilities,
        incomeBreakdown: validatedInput.incomeBreakdown,
        expenseBreakdown: validatedInput.expenseBreakdown,
      });

      logger.info('Assessment entity created', {
        assessmentId: assessment.getId(),
        hardshipLevel: assessment.getHardship().getLevel(),
        customerId: assessment.getCustomerId(),
      });

      // Step 4: Save to repository
      await this.assessmentRepository.save(assessment);

      logger.info('Assessment persisted successfully', {
        assessmentId: assessment.getId(),
      });

      // Step 5: Determine if escalation is needed
      const shouldEscalate = await this.assessmentDomainService.shouldEscalateToCase(
        assessment
      );

      if (shouldEscalate) {
        logger.info('Assessment requires case escalation', {
          assessmentId: assessment.getId(),
          reason: `${assessment.getHardship().getLevel()} hardship level`,
        });
      }

      // Return response
      return {
        assessmentId: assessment.getId(),
        hardshipLevel: assessment.getHardship().getLevel(),
        requiresManualReview: assessment.requiresManualReview(),
        createdAt: assessment.getCreatedAt().toISOString(),
      };
    } catch (error) {
      if (error instanceof DomainError) {
        logger.warn('Assessment creation failed - domain error', {
          code: error.code,
          message: error.message,
          customerId: input.customerId,
        });
        throw error;
      }

      logger.error('Assessment creation failed - unexpected error', {
        error: error instanceof Error ? error.message : String(error),
        customerId: input.customerId,
      });

      throw new DomainError(
        'CREATE_ASSESSMENT_FAILED',
        'Failed to create assessment',
        error instanceof Error ? { originalError: error.message } : {}
      );
    }
  }
}
