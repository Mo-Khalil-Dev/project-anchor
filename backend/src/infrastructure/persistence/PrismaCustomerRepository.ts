import { prisma } from '../../utils/db';
import { Result } from '../../shared/result';

export interface Customer {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}


export class PrismaCustomerRepository {
  async create(email: string): Promise<Result<Customer, Error>> {
    try {
      const customer = await prisma.customer.create({
        data: { email, monthlyBill:300, arrears: 600 },
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
}
