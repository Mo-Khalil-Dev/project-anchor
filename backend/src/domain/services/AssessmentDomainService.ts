import { Assessment } from '../entities/Assessment.entity';
import { IAssessmentRepository } from '../repositories/IAssessmentRepository';
import { DomainError } from '../errors/DomainError';

/**
 * Assessment Domain Service
 *
 * Orchestrates domain logic that doesn't fit cleanly into a single entity.
 * Handles cross-aggregate operations and complex business rules.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Orchestrates Assessment-related domain logic
 * - Open/Closed: Extensible via dependency injection
 * - Liskov Substitution: Consistent method contracts
 * - Interface Segregation: Only exposes needed methods
 * - Dependency Inversion: Depends on IAssessmentRepository abstraction
 */
export class AssessmentDomainService {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  /**
   * Determine if a newly created assessment requires immediate case escalation.
   * Business rule: SEVERE hardship + high vulnerability + significant arrears.
   */
  async shouldEscalateToCase(assessment: Assessment): Promise<boolean> {
    const hardship = assessment.getHardship();

    // Rule 1: SEVERE hardship requires escalation
    if (hardship.isSevere()) {
      return true;
    }

    // Rule 2: MODERATE hardship + vulnerable + arrears
    if (hardship.isModerate() && assessment.isVulnerable() && assessment.getArrears() > 0) {
      return true;
    }

    // Rule 3: Significant arrears (>6 months of income)
    if (assessment.getArrears() > assessment.getMonthlyIncome() * 6) {
      return true;
    }

    return false;
  }

  /**
   * Check if customer is eligible for hardship support.
   * Eligibility: Any level of hardship detected.
   */
  isEligibleForSupport(assessment: Assessment): boolean {
    const hardship = assessment.getHardship();
    return !hardship.isNone();
  }

  /**
   * Get confidence level in the assessment for automated decision-making.
   * Considers both hardship confidence and data quality.
   */
  getAssessmentConfidence(assessment: Assessment): 'HIGH' | 'MEDIUM' | 'LOW' {
    const hardshipConfidence = assessment.getHardship().getConfidenceScore();
    const dataQuality = assessment.hasDataQualityIssues();

    const overallConfidence = (hardshipConfidence + dataQuality) / 2;

    if (overallConfidence >= 0.75) {
      return 'HIGH';
    } else if (overallConfidence >= 0.5) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Compare two assessments for the same customer.
   * Returns which assessment shows improvement/deterioration.
   *
   * @returns 'improved' | 'deteriorated' | 'stable'
   */
  compareAssessments(previous: Assessment, current: Assessment): 'improved' | 'deteriorated' | 'stable' {
    const previousDisposable = previous.calculateDisposableIncome();
    const currentDisposable = current.calculateDisposableIncome();

    const disposableChange = currentDisposable - previousDisposable;

    // If disposable income improved by >10%, assessment improved
    if (disposableChange > Math.abs(previousDisposable) * 0.1) {
      return 'improved';
    }

    // If disposable income deteriorated by >10%, assessment deteriorated
    if (disposableChange < -Math.abs(previousDisposable) * 0.1) {
      return 'deteriorated';
    }

    // Check hardship level
    const previousSeverity = previous.getHardship().getSeverityRank();
    const currentSeverity = current.getHardship().getSeverityRank();

    if (currentSeverity > previousSeverity) {
      return 'deteriorated';
    } else if (currentSeverity < previousSeverity) {
      return 'improved';
    }

    return 'stable';
  }

  /**
   * Check if assessment requires periodic reassessment (e.g., every 6 months).
   * Business rule: Long-term support plans should be reassessed regularly.
   */
  requiresReassessment(assessment: Assessment, monthsElapsed: number): boolean {
    // All assessments older than 6 months should be reassessed
    return monthsElapsed >= 6;
  }

  /**
   * Validate that a new assessment is not a duplicate of a recent one.
   * Business rule: Don't allow duplicate assessments within 24 hours.
   *
   * @throws DomainError if duplicate detected
   */
  async validateNoDuplicateAssessment(customerId: string): Promise<void> {
    const recentAssessments = await this.assessmentRepository.findByCustomerId(customerId);

    if (recentAssessments.length === 0) {
      return; // No recent assessments, all clear
    }

    const mostRecent = recentAssessments[0];
    const hoursElapsed =
      (new Date().getTime() - mostRecent.getCreatedAt().getTime()) / (1000 * 60 * 60);

    if (hoursElapsed < 24) {
      throw new DomainError(
        'DUPLICATE_ASSESSMENT',
        'Assessment was already completed within the last 24 hours',
        { lastAssessmentId: mostRecent.getId(), hoursElapsed }
      );
    }
  }

  /**
   * Determine appropriate payment plan tier based on assessment.
   * Returns recommendation for (CONSERVATIVE | BALANCED | AGGRESSIVE).
   *
   * Business Rules:
   * - SEVERE hardship → CONSERVATIVE (extended terms, lower payments)
   * - MODERATE + vulnerable → CONSERVATIVE
   * - LOW hardship → BALANCED or AGGRESSIVE
   * - NONE hardship → allow aggressive terms
   */
  recommendPaymentPlanTier(assessment: Assessment): 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE' {
    const hardship = assessment.getHardship();

    if (hardship.isSevere()) {
      return 'CONSERVATIVE';
    }

    if (hardship.isModerate() && assessment.isVulnerable()) {
      return 'CONSERVATIVE';
    }

    if (hardship.isModerate()) {
      return 'BALANCED';
    }

    if (hardship.isLow()) {
      return 'BALANCED';
    }

    // No hardship detected
    return 'AGGRESSIVE';
  }

  /**
   * Calculate appropriate plan duration based on assessment.
   * Returns duration in months.
   *
   * Business Rules:
   * - Base duration determined by disposable income
   * - Vulnerability flags add 50% duration extension
   * - Age/pension status adds 50% extension
   */
  calculateRecommendedPlanDuration(assessment: Assessment): number {
    let baseDuration = 24; // 24 months default

    const disposableIncome = assessment.calculateDisposableIncome();
    const monthlyBill = assessment.getBillAmount();

    // If very tight budget, extend terms
    if (disposableIncome < monthlyBill * 0.5) {
      baseDuration = 36;
    }

    if (disposableIncome < 0) {
      baseDuration = 36;
    }

    // Apply vulnerability multiplier
    if (assessment.isVulnerable()) {
      baseDuration = Math.floor(baseDuration * 1.5);
    }

    // Cap at 60 months
    return Math.min(baseDuration, 60);
  }
}
