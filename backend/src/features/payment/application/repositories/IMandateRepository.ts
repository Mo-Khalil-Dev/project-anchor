import type { Result } from '@/features/shared/result';
import type { MandateStatus } from '@/features/shared/types/mandate-status';

export interface MandateData {
  id: string;
  status: MandateStatus;
  gocardlessId: string | null;
  createdAt: string;
}

export interface IMandateRepository {
  findLatestByCustomerId(customerId: string): Promise<Result<MandateData | null, Error>>;
}
