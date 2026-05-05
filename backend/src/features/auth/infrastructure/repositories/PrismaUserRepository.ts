import type { PrismaClient } from '@prisma/client';
import { Result } from '../../../shared/result';
import type { User } from '../../domain/entities/User';
import type { IUserRepository, CreateUserInput, UpdateUserInput, UserWithCustomerJourney } from '../../application/repositories/IUserRepository';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByExternalId(externalId: string): Promise<Result<User | null, Error>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { externalId },
      });

      return Result.ok(user ? UserMapper.toDomain(user) : null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to find user by external ID: ${message}`));
    }
  }

  async findByEmail(email: string): Promise<Result<User | null, Error>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      return Result.ok(user ? UserMapper.toDomain(user) : null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to find user by email: ${message}`));
    }
  }

  async findById(id: string): Promise<Result<User | null, Error>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      return Result.ok(user ? UserMapper.toDomain(user) : null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to find user by ID: ${message}`));
    }
  }

  async create(input: CreateUserInput): Promise<Result<User, Error>> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          externalId: input.externalId,
          firstName: input.firstName,
          lastName: input.lastName,
          role: 'customer',
        },
      });

      return Result.ok(UserMapper.toDomain(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to create user: ${message}`));
    }
  }

  async update(input: UpdateUserInput): Promise<Result<User, Error>> {
    try {
      const user = await this.prisma.user.update({
        where: { id: input.id },
        data: {
          externalId: input.externalId,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });

      return Result.ok(UserMapper.toDomain(user));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to update user: ${message}`));
    }
  }

  async findWithCustomerJourney(userId: string): Promise<Result<UserWithCustomerJourney | null, Error>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          customer: {
            include: {
              bankConnections: true,
              assessments: true,
            },
          },
        },
      });

      if (!user) {
        return Result.ok(null);
      }

      return Result.ok({
        user: UserMapper.toDomain(user),
        role: user.role as 'admin' | 'customer',
        customerId: user.customerId || undefined,
        bankConnectionCount: user.customer?.bankConnections?.length ?? 0,
        assessmentCount: user.customer?.assessments?.length ?? 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to find user with customer journey: ${message}`));
    }
  }
}
