import type { SessionLog as PrismaSessionLog } from '@prisma/client';
import { SessionLog, type SessionAction } from '@/features/auth/domain/entities/SessionLog';

export class SessionLogMapper {
  static toDomain(raw: PrismaSessionLog): SessionLog {
    return new SessionLog(
      raw.id,
      raw.userId,
      raw.action as SessionAction,
      raw.ipAddress || undefined,
      raw.userAgent || undefined,
      raw.createdAt
    );
  }

  static toPersistence(domain: SessionLog): Partial<PrismaSessionLog> {
    return {
      id: domain.id,
      userId: domain.getUserId(),
      action: domain.getAction(),
      ipAddress: domain.getIpAddress() || null,
      userAgent: domain.getUserAgent() || null,
    };
  }
}
