import { Result } from '../../../../shared/result';
import { Assessment, type IAssessmentRepository, type PlanType } from '../../../domain/entities';
import { prisma } from '../../../../shared/utils/db';
import { AssessmentMapper } from '../../mappers';
import type { ILogger } from '../../../../shared/logging';


export class PrismaAssessmentRepository implements IAssessmentRepository {
  private mapper: AssessmentMapper;

  constructor(logger: ILogger) {
    this.mapper = new AssessmentMapper(logger);
  }

  async save(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const persistenceData = this.mapper.toPersistence(assessment);
      const created = await prisma.assessment.create({
        data: {
          ...persistenceData,
          disposableIncome: assessment.calculateDisposableIncome(),
          billRatio: assessment.calculateBillRatio(),
          hardshipLevel: assessment.getHardshipLevel(),
          sustainabilityScore: assessment.getSustainabilityScore(),
        } as any,
      });

      return Result.ok(this.mapper.toDomain(created));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save referenceData';
      return Result.fail(new Error(`Assessment save failed: ${message}`));
    }
  }

  async findById(id: string): Promise<Result<Assessment | null, Error>> {
    try {
      const record = await prisma.assessment.findUnique({
        where: { id },
      });

      if (!record) {
        return Result.ok(null);
      }

      return Result.ok(this.mapper.toDomain(record));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find referenceData';
      return Result.fail(new Error(`Assessment lookup failed: ${message}`));
    }
  }

  async findByCustomerId(customerId: string): Promise<Result<Assessment[], Error>> {
    try {
      const records = await prisma.assessment.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      const assessments = records.map(record => this.mapper.toDomain(record));
      return Result.ok(assessments);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find assessments';
      return Result.fail(new Error(`Assessment lookup failed: ${message}`));
    }
  }

  async findLatestByCustomerId(customerId: string): Promise<Result<Assessment | null, Error>> {
    try {
      const record = await prisma.assessment.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      if (!record) {
        return Result.ok(null);
      }

      return Result.ok(this.mapper.toDomain(record));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find referenceData';
      return Result.fail(new Error(`Assessment lookup failed: ${message}`));
    }
  }

  async update(assessment: Assessment): Promise<Result<Assessment, Error>> {
    try {
      const persistenceData = this.mapper.toPersistence(assessment);
      const updated = await prisma.assessment.update({
        where: { id: assessment.getId() },
        data: {
          ...persistenceData,
          disposableIncome: assessment.calculateDisposableIncome(),
          billRatio: assessment.calculateBillRatio(),
          hardshipLevel: assessment.getHardshipLevel(),
          sustainabilityScore: assessment.getSustainabilityScore(),
          updatedAt: new Date(),
        },
      });

      return Result.ok(this.mapper.toDomain(updated));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update referenceData';
      return Result.fail(new Error(`Assessment update failed: ${message}`));
    }
  }

  async updateSelectedPlan(assessmentId: string, planType: PlanType): Promise<Result<void, Error>> {
    try {
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          selectedPlan: planType,
          updatedAt: new Date(),
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update selected plan';
      return Result.fail(new Error(`Selected plan update failed: ${message}`));
    }
  }
}
