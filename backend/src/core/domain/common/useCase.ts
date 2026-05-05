import { Result } from '@/features/shared/result';
import { DomainError } from '@/core/domain/errors/domainError';
import { ApplicationError } from '@/core/domain/errors';
export interface Usecase<I, O> {
  execute(input?: I): Promise<Result<O | null, DomainError|ApplicationError|Error>>;
}
