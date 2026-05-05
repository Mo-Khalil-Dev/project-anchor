import type { User as PrismaUser } from '@prisma/client';
import { User } from '@/features/auth/domain/entities/User';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.reconstruct(
      raw.id,
      raw.email,
      raw.externalId,
      raw.firstName || undefined,
      raw.lastName || undefined,
      raw.createdAt
    );
  }

  static toPersistence(domain: User): Partial<PrismaUser> {
    return {
      id: domain.id,
      email: domain.getEmail(),
      externalId: domain.getExternalId(),
      firstName: domain.getFirstName() || null,
      lastName: domain.getLastName() || null,
    };
  }
}
