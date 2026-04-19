import { Assessment } from '../entities/Assessment.entity';

/**
 * Assessment Repository Interface
 *
 * Defines the contract for persisting and retrieving Assessment aggregates.
 * Implementation is in the Infrastructure layer (Prisma adapter).
 *
 * SOLID Principles Applied:
 * - Dependency Inversion: Domain depends on interface, not concrete implementation
 * - Single Responsibility: Only defines persistence contract
 * - Interface Segregation: Only methods needed by domain
 */
export interface IAssessmentRepository {
  /**
   * Save a new assessment.
   * @throws If assessment with same ID already exists
   */
  save(assessment: Assessment): Promise<void>;

  /**
   * Retrieve assessment by ID.
   * @returns Assessment or null if not found
   */
  findById(id: string): Promise<Assessment | null>;

  /**
   * Retrieve all assessments for a customer.
   * Ordered by creation date (newest first).
   */
  findByCustomerId(customerId: string): Promise<Assessment[]>;

  /**
   * Retrieve assessments by hardship level.
   * Used for filtering by severity.
   */
  findByHardshipLevel(level: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE'): Promise<Assessment[]>;

  /**
   * Retrieve recent assessments (created in last N days).
   * Used for hardship detection automation.
   */
  findRecent(daysBack: number): Promise<Assessment[]>;

  /**
   * Count total assessments.
   * Useful for analytics and pagination.
   */
  count(): Promise<number>;

  /**
   * Check if assessment exists by ID.
   */
  exists(id: string): Promise<boolean>;
}
