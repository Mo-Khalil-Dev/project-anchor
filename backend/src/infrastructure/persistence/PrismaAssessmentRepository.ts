import { Assessment } from '../../domain/entities/Assessment.entity';
import { Hardship } from '../../domain/value-objects/Hardship.vo';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { PrismaClient } from '@prisma/client';
import { DomainError } from '../../domain/errors/DomainError';

/**
 * Prisma Implementation of IAssessmentRepository
 *
 * Handles all persistence operations for Assessment aggregates.
 * Translates between domain entities and database models.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles Assessment persistence
 * - Open/Closed: Can add caching, logging, etc. without changing interface
 * - Liskov Substitution: Fully implements IAssessmentRepository contract
 * - Interface Segregation: All methods are necessary
 * - Dependency Inversion: Depends on IAssessmentRepository, not vice versa
 */
export class PrismaAssessmentRepository implements IAssessmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(assessment: Assessment): Promise<void> {
    try {
      // Check for duplicates
      const existing = await this.prisma.assessment.findUnique({
        where: { id: assessment.getId() },
      });

      if (existing) {
        throw new DomainError('ASSESSMENT_EXISTS', 'Assessment with this ID already exists');
      }

      const hardship = assessment.getHardship();

      await this.prisma.assessment.create({
        data: {
          id: assessment.getId(),
          customer_id: assessment.getCustomerId(),
          monthly_income: assessment.getMonthlyIncome(),
          total_expenses: assessment.getTotalExpenses(),
          disposable_income: assessment.calculateDisposableIncome(),
          bill_amount: assessment.getBillAmount(),
          bill_percentage: assessment.calculateBillPercentageOfIncome(),
          arrears: assessment.getArrears(),
          hardship_level: hardship.getLevel(),
          confidence_score: hardship.getConfidenceScore(),
          vulnerabilities: assessment.getVulnerabilities() as any,
          income_breakdown: assessment.getIncomeBreakdown() as any,
          expense_breakdown: assessment.getExpenseBreakdown() as any,
          created_at: assessment.getCreatedAt(),
          updated_at: assessment.getUpdatedAt(),
        },
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      // Translate Prisma errors to domain errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new DomainError('ASSESSMENT_EXISTS', 'Assessment with this ID already exists');
      }

      throw new DomainError('PERSISTENCE_ERROR', `Failed to save assessment: ${error}`);
    }
  }

  async findById(id: string): Promise<Assessment | null> {
    try {
      const record = await this.prisma.assessment.findUnique({
        where: { id },
      });

      if (!record) {
        return null;
      }

      return this.mapToDomain(record);
    } catch (error) {
      throw new DomainError('FETCH_ERROR', `Failed to fetch assessment: ${error}`);
    }
  }

  async findByCustomerId(customerId: string): Promise<Assessment[]> {
    try {
      const records = await this.prisma.assessment.findMany({
        where: { customer_id: customerId },
        orderBy: { created_at: 'desc' },
      });

      return records.map((record) => this.mapToDomain(record));
    } catch (error) {
      throw new DomainError('FETCH_ERROR', `Failed to fetch assessments for customer: ${error}`);
    }
  }

  async findByHardshipLevel(level: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE'): Promise<Assessment[]> {
    try {
      const records = await this.prisma.assessment.findMany({
        where: { hardship_level: level },
        orderBy: { created_at: 'desc' },
      });

      return records.map((record) => this.mapToDomain(record));
    } catch (error) {
      throw new DomainError(
        'FETCH_ERROR',
        `Failed to fetch assessments by hardship level: ${error}`
      );
    }
  }

  async findRecent(daysBack: number): Promise<Assessment[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const records = await this.prisma.assessment.findMany({
        where: {
          created_at: {
            gte: cutoffDate,
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return records.map((record) => this.mapToDomain(record));
    } catch (error) {
      throw new DomainError('FETCH_ERROR', `Failed to fetch recent assessments: ${error}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.assessment.count();
    } catch (error) {
      throw new DomainError('FETCH_ERROR', `Failed to count assessments: ${error}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const assessment = await this.prisma.assessment.findUnique({
        where: { id },
        select: { id: true },
      });

      return assessment !== null;
    } catch (error) {
      throw new DomainError('FETCH_ERROR', `Failed to check assessment existence: ${error}`);
    }
  }

  /**
   * Map database record to domain Assessment entity.
   * Reconstructs the aggregate root from persisted data.
   */
  private mapToDomain(record: any): Assessment {
    const hardship = Hardship.reconstruct(
      record.hardship_level as any,
      record.confidence_score,
      record.disposable_income,
      record.bill_percentage
    );

    return Assessment.fromPersistence({
      id: record.id,
      customerId: record.customer_id,
      monthlyIncome: record.monthly_income,
      totalExpenses: record.total_expenses,
      billAmount: record.bill_amount,
      arrears: record.arrears,
      vulnerabilities: record.vulnerabilities || {},
      incomeBreakdown: record.income_breakdown || {},
      expenseBreakdown: record.expense_breakdown || {},
      hardship,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }
}
