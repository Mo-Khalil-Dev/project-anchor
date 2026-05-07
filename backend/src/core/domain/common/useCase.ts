import { Result } from '../../../features/shared/result';
import { DomainError } from '../errors/domainError';
import { ApplicationError } from '../errors';
export interface Usecase<I, O> {
  execute(input?: I): Promise<Result<O | null, DomainError | ApplicationError | Error>>;
}
