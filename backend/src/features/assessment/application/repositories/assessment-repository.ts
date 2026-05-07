import type { Result } from '../../../shared/result';
import type { Assessment } from '@/features/assessment/domain/entities/assessment.entity';
import type { PlanType } from '@/features/assessment/domain/entities/plan-type';

export interface IAssessmentRepository {
  save(assessment: Assessment): Promise<Result<Assessment, Error>>;
  findById(id: string): Promise<Result<Assessment | null, Error>>;
  findByCustomerId(customerId: string): Promise<Result<Assessment[], Error>>;
  findLatestByCustomerId(customerId: string): Promise<Result<Assessment | null, Error>>;
  update(assessment: Assessment): Promise<Result<Assessment, Error>>;
  updateSelectedPlan(assessmentId: string, planType: PlanType): Promise<Result<void, Error>>;
}
