import type { Result } from '../../../shared/result';
import type { User } from '../../domain/entities/User';

export interface CreateUserInput {
  email: string;
  externalId: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserInput {
  id: string;
  externalId: string;
  firstName?: string;
  lastName?: string;
}

export interface UserWithCustomerJourney {
  user: User;
  role: 'admin' | 'customer';
  customerId?: string;
  bankConnectionCount: number;
  assessmentCount: number;
}

export interface IUserRepository {
  /**
   * Find user by external ID (provider-specific user ID)
   */
  findByExternalId(externalId: string): Promise<Result<User | null, Error>>;

  /**
   * Find user by email address
   */
  findByEmail(email: string): Promise<Result<User | null, Error>>;

  /**
   * Find user by internal user ID
   */
  findById(id: string): Promise<Result<User | null, Error>>;

  /**
   * Create a new user
   */
  create(input: CreateUserInput): Promise<Result<User, Error>>;

  /**
   * Update existing user
   */
  update(input: UpdateUserInput): Promise<Result<User, Error>>;

  /**
   * Find user with customer journey data (for redirect logic)
   */
  findWithCustomerJourney(userId: string): Promise<Result<UserWithCustomerJourney | null, Error>>;
}
