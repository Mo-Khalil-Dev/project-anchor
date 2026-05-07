import type { PrismaClient } from '@prisma/client';
import { Result } from '../../../shared/result';
import type { SessionLog } from '../../domain/entities/SessionLog';
import type {
  ISessionLogRepository,
  CreateSessionLogInput,
} from '../../application/repositories/ISessionLogRepository';
import { SessionLogMapper } from '../mappers/SessionLogMapper';

export class PrismaSessionLogRepository implements ISessionLogRepository {
  constructor(private prisma: PrismaClient) {}

  async log(input: CreateSessionLogInput): Promise<Result<SessionLog, Error>> {
    try {
      const sessionLog = await this.prisma.sessionLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });

      return Result.ok(SessionLogMapper.toDomain(sessionLog));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to log session: ${message}`));
    }
  }
}
