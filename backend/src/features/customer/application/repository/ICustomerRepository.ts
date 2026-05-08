import type { Result } from '@/features/shared/result';

import { Customer } from "@/features/customer/domain/entities/customer";

export interface ICustomerRepository {
  create(email: string): Promise<Result<Customer, Error>>;
  findById(id: string): Promise<Result<Customer | null, Error>>;
  findByEmail(email: string): Promise<Result<Customer | null, Error>>;
  findByUtilityAccountNumber(accountNumber: string): Promise<Result<Customer | null, Error>>;
  findCustomerIdByUserId(userId: string): Promise<Result<string | null, Error>>;
  isUserAlreadyLinked(userId: string): Promise<Result<boolean, Error>>;
  linkToUser(customerId: string, userId: string): Promise<Result<void, Error>>;
}