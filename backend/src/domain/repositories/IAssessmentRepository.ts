import { Result } from '../../shared/result';
import { Assessment } from '../entities/Assessment.entity';

export interface IAssessmentRepository {
  save(assessment: Assessment): Promise<Result<Assessment, Error>>;
  findById(id: string): Promise<Result<Assessment | null, Error>>;
  findByCustomerId(customerId: string): Promise<Result<Assessment[], Error>>;
  update(assessment: Assessment): Promise<Result<Assessment, Error>>;
}
