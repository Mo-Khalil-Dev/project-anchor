import type { Result } from '@/features/shared/result';

export interface IUserRepository {
  findCustomerIdByUserId(userId: string): Promise<Result<string | null, Error>>;
}
