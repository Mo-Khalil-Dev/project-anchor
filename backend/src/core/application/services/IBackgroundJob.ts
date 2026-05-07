import type { Result } from '@/features/shared/result';

export interface IBackgroundJob<TPayload> {
  execute(payload: TPayload): Promise<Result<void, Error>>;
}
