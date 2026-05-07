import { prisma } from '../../../shared/utils/db';
import { Result } from '../../../shared/result';
import {
  IBankConnectionRepository
} from '@/features/bankConnection/application/respositories/IBankConnectionRepository';
import { BankConnection } from '@/features/bankConnection/domain/entites/bankConnection';

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
          updatedAt: connection.updatedAt || new Date(),
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
          updatedAt: connection.updatedAt || new Date(),
        },
      });
      return Result.ok(connection);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDomain(record: any): BankConnection {
    return new BankConnection({
      id: record.id,
      customerId: record.customerId,
      oauthState: record.oauthState,
      status: record.status,
      connectedAt: record.connectedAt,
      dataRetrievedAt: record.dataRetrievedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
