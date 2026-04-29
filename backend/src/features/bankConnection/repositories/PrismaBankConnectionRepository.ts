import { prisma } from '../../shared/utils/db';
import { BankConnection } from '../types/bankConnection.types';
import type { IBankConnectionRepository } from '../types/bankConnection.types';
import { Result } from '../../shared/result';

export class PrismaBankConnectionRepository implements IBankConnectionRepository {
  async save(connection: BankConnection): Promise<Result<BankConnection, Error>> {
    try {
      await prisma.bankConnection.create({
        data: {
          id: connection.id,
          customerId: connection.customerId,
          oauthState: connection.oauthState,
          status: connection.status,
          connectedAt: connection.connectedAt,
          dataRetrievedAt: connection.dataRetrievedAt,
        },
      });
      return Result.ok(connection);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: string): Promise<Result<BankConnection | null, Error>> {
    try {
      const record = await prisma.bankConnection.findUnique({ where: { id } });
      if (!record) return Result.ok(null);
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByCustomerId(customerId: string): Promise<Result<BankConnection | null, Error>> {
    try {
      const record = await prisma.bankConnection.findFirst({
        where: { customerId, status: { not: 'DISCONNECTED' } },
        orderBy: { createdAt: 'desc' },
      });
      if (!record) return Result.ok(null);
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByOAuthState(state: string): Promise<Result<BankConnection | null, Error>> {
    try {
      const record = await prisma.bankConnection.findUnique({ where: { oauthState: state } });
      if (!record) return Result.ok(null);
      return Result.ok(this.toDomain(record));
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByJobId(_jobId: string): Promise<Result<BankConnection | null, Error>> {
    return Result.ok(null);
  }

  async update(connection: BankConnection): Promise<Result<BankConnection, Error>> {
    try {
      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: {
          status: connection.status,
          connectedAt: connection.connectedAt,
          dataRetrievedAt: connection.dataRetrievedAt,
        },
      });
      return Result.ok(connection);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(record: any): BankConnection {
    return new BankConnection(
      record.id,
      record.customerId,
      record.oauthState,
      record.status,
      record.connectedAt,
      record.dataRetrievedAt,
      record.createdAt,
      record.updatedAt,
    );
  }
}
