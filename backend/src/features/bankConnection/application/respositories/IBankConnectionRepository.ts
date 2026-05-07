import type { Result } from '@/features/shared/result';

import { BankConnection } from '@/features/bankConnection/domain/entites/bankConnection';

export interface IBankConnectionRepository {
  save(connection: BankConnection): Promise<Result<BankConnection, Error>>;
  findById(id: string): Promise<Result<BankConnection | null, Error>>;
  findByCustomerId(customerId: string): Promise<Result<BankConnection | null, Error>>;
  findByOAuthState(state: string): Promise<Result<BankConnection | null, Error>>;
  findByJobId(jobId: string): Promise<Result<BankConnection | null, Error>>;
  update(connection: BankConnection): Promise<Result<BankConnection, Error>>;
}
