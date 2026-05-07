import { prisma } from '../../shared/utils/db';
import { Result } from '../../shared/result';
import type { Customer, ICustomerRepository } from '../types/customer.types';

export class PrismaCustomerRepository implements ICustomerRepository {
  async create(email: string): Promise<Result<Customer, Error>> {
    try {
      const customer = await prisma.customer.create({
        data: { email, monthlyBill: 300, arrears: 600 },
      });
      return Result.ok(customer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to create customer: ${message}`));
    }
  }

  async findById(id: string): Promise<Result<Customer | null, Error>> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });
      return Result.ok(customer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to fetch customer: ${message}`));
    }
  }

  async findByEmail(email: string): Promise<Result<Customer | null, Error>> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { email },
      });
      return Result.ok(customer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to fetch customer: ${message}`));
    }
  }

  /**
   * Find a customer by utility account number
   */
  async findByUtilityAccountNumber(accountNumber: string): Promise<Result<Customer | null, Error>> {
    try {
      const customer = await prisma.customer.findFirst({
        where: { utilityAccountNo: accountNumber },
      });
      return Result.ok(customer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to fetch customer by account number: ${message}`));
    }
  }

  /**
   * Return the customerId linked to a user, or null if not yet linked
   */
  async findCustomerIdByUserId(userId: string): Promise<Result<string | null, Error>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customerId: true },
      });
      return Result.ok(user?.customerId ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to retrieve customer ID for user: ${message}`));
    }
  }

  /**
   * Check if a user is already linked to a customer
   * TODO: Refactor — this duplicates findCustomerIdByUserId. Replace with:
   *   const result = await this.findCustomerIdByUserId(userId);
   *   return result.map(id => !!id);
   */
  async isUserAlreadyLinked(userId: string): Promise<Result<boolean, Error>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customerId: true },
      });
      return Result.ok(!!user?.customerId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to check user link status: ${message}`));
    }
  }

  /**
   * Link a customer to a user
   */
  async linkToUser(customerId: string, userId: string): Promise<Result<void, Error>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { customerId },
      });
      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to link customer to user: ${message}`));
    }
  }
}
