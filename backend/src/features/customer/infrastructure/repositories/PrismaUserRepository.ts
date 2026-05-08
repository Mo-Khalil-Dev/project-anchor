import { Result } from '@/features/shared/result';
import { prisma } from '@/features/shared/utils/db';
import type { IUserRepository } from '../../application/repository/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async findCustomerIdByUserId(userId: string): Promise<Result<string | null, Error>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customerId: true },
      });

      if (!user) {
        return Result.fail(new Error(`User not found: ${userId}`));
      }

      // User exists but not linked to customer - return null (not an error)
      return Result.ok(user.customerId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find user';
      return Result.fail(new Error(`User lookup failed: ${message}`));
    }
  }
}
