import { Result } from '@/features/shared/result';
import { prisma } from '@/features/shared/utils/db';
import { isMandateStatus } from '@/features/shared/types/mandate-status';
import type {
  IMandateRepository,
  MandateData,
} from '../../../application/repositories/IMandateRepository';

export class PrismaMandateRepository implements IMandateRepository {
  async findLatestByCustomerId(customerId: string): Promise<Result<MandateData | null, Error>> {
    try {
      const mandateRecord = await prisma.mandate.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          gocardlessId: true,
          createdAt: true,
        },
      });

      if (!mandateRecord) {
        return Result.ok(null);
      }

      if (!isMandateStatus(mandateRecord.status)) {
        return Result.fail(new Error(`Invalid mandate status: ${mandateRecord.status}`));
      }

      const mandate: MandateData = {
        id: mandateRecord.id,
        status: mandateRecord.status,
        gocardlessId: mandateRecord.gocardlessId,
        createdAt: mandateRecord.createdAt.toISOString(),
      };

      return Result.ok(mandate);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch mandate';
      return Result.fail(new Error(`Mandate lookup failed: ${message}`));
    }
  }
}
