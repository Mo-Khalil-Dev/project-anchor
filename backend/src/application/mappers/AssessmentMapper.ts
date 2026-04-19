import { Assessment } from '../../domain/entities/Assessment.entity';
import {
  AssessmentResponse,
  CreateAssessmentRequest,
  HardshipDto,
  AssessmentBreakdownResponse,
} from '../dtos/assessment.dtos';
import { AssessmentDomainService } from '../../domain/services/AssessmentDomainService';

/**
 * Assessment Mapper
 *
 * Converts between domain entities and DTOs.
 * Handles all serialization/deserialization logic.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles Assessment mapping
 * - Open/Closed: New DTO formats don't require entity changes
 * - Liskov Substitution: Consistent mapping behavior
 * - Interface Segregation: Only necessary methods
 * - Dependency Inversion: Depends on abstractions (Assessment, services)
 */
export class AssessmentMapper {
  /**
   * Map domain Assessment to response DTO.
   */
  static toResponse(assessment: Assessment): AssessmentResponse {
    const hardship = assessment.getHardship();

    return {
      id: assessment.getId(),
      customerId: assessment.getCustomerId(),
      monthlyIncome: assessment.getMonthlyIncome(),
      totalExpenses: assessment.getTotalExpenses(),
      disposableIncome: assessment.calculateDisposableIncome(),
      billAmount: assessment.getBillAmount(),
      billPercentage: assessment.calculateBillPercentageOfIncome(),
      arrears: assessment.getArrears(),
      hardship: {
        level: hardship.getLevel(),
        confidenceScore: hardship.getConfidenceScore(),
        disposableIncome: hardship.getDisposableIncome(),
        billPercentage: hardship.getBillPercentage(),
      },
      vulnerabilities: assessment.getVulnerabilities(),
      incomeBreakdown: assessment.getIncomeBreakdown(),
      expenseBreakdown: assessment.getExpenseBreakdown(),
      requiresManualReview: assessment.requiresManualReview(),
      createdAt: assessment.getCreatedAt().toISOString(),
      updatedAt: assessment.getUpdatedAt().toISOString(),
    };
  }

  /**
   * Map domain Assessment to breakdown response (with additional analysis).
   */
  static toBreakdownResponse(
    assessment: Assessment,
    domainService: AssessmentDomainService
  ): AssessmentBreakdownResponse {
    return {
      assessment: this.toResponse(assessment),
      confidence: domainService.getAssessmentConfidence(assessment),
      eligibleForSupport: domainService.isEligibleForSupport(assessment),
      recommendedPlanTier: domainService.recommendPaymentPlanTier(assessment),
      recommendedDurationMonths: domainService.calculateRecommendedPlanDuration(assessment),
    };
  }

  /**
   * Map hardship value object to DTO.
   */
  static hardshipToDto(hardship: any): HardshipDto {
    return {
      level: hardship.getLevel(),
      confidenceScore: hardship.getConfidenceScore(),
      disposableIncome: hardship.getDisposableIncome(),
      billPercentage: hardship.getBillPercentage(),
    };
  }

  /**
   * Validate and normalize input request.
   * Throws error if validation fails.
   */
  static validateCreateRequest(input: any): CreateAssessmentRequest {
    const errors: string[] = [];

    // Required fields
    if (!input.customerId || typeof input.customerId !== 'string') {
      errors.push('customerId is required and must be a string');
    }

    if (typeof input.monthlyIncome !== 'number' || input.monthlyIncome < 0) {
      errors.push('monthlyIncome must be a non-negative number');
    }

    if (typeof input.totalExpenses !== 'number' || input.totalExpenses < 0) {
      errors.push('totalExpenses must be a non-negative number');
    }

    if (typeof input.billAmount !== 'number' || input.billAmount < 0) {
      errors.push('billAmount must be a non-negative number');
    }

    if (typeof input.arrears !== 'number' || input.arrears < 0) {
      errors.push('arrears must be a non-negative number');
    }

    if (!input.vulnerabilities || typeof input.vulnerabilities !== 'object') {
      errors.push('vulnerabilities must be an object');
    }

    if (!input.incomeBreakdown || typeof input.incomeBreakdown !== 'object') {
      errors.push('incomeBreakdown must be an object');
    }

    if (!input.expenseBreakdown || typeof input.expenseBreakdown !== 'object') {
      errors.push('expenseBreakdown must be an object');
    }

    if (errors.length > 0) {
      const error = new Error(`Validation errors: ${errors.join(', ')}`);
      (error as any).code = 'VALIDATION_ERROR';
      (error as any).details = { errors };
      throw error;
    }

    return input as CreateAssessmentRequest;
  }
}
