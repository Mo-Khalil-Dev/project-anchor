import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import type { IUserRepository } from '@/features/customer/application/repository/IUserRepository';
import { GetUserCustomerIdQuery } from './GetUserCustomerIdQuery';

describe('GetUserCustomerIdQuery', () => {
  let userRepository: IUserRepository;
  let logger: ILogger;
  let query: GetUserCustomerIdQuery;

  beforeEach(() => {
    userRepository = {
      findCustomerIdByUserId: jest.fn(),
    };

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnValue({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      }),
    };

    query = new GetUserCustomerIdQuery(userRepository, logger);
  });

  it('should return customerId when user exists and is linked', async () => {
    const userId = 'user-123';
    const customerId = 'customer-456';

    (userRepository.findCustomerIdByUserId as jest.Mock).mockResolvedValue(
      Result.ok(customerId)
    );

    const result = await query.execute({ userId });

    expect(result.isOk).toBe(true);
    expect(result.getOrElse(null)).toBe(customerId);
    expect(logger.info).toHaveBeenCalledWith(
      'Resolving user to customer',
      { userId }
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Resolved user to customer',
      { userId, customerId }
    );
  });

  it('should return null when user exists but not linked to customer', async () => {
    const userId = 'user-123';

    (userRepository.findCustomerIdByUserId as jest.Mock).mockResolvedValue(
      Result.ok(null)
    );

    const result = await query.execute({ userId });

    expect(result.isOk).toBe(true);
    expect(result.getOrElse('default')).toBe(null);
    expect(logger.info).toHaveBeenCalledWith(
      'User not linked to customer',
      { userId }
    );
  });

  it('should propagate error when user not found', async () => {
    const userId = 'user-123';
    const error = new Error('User not found');

    (userRepository.findCustomerIdByUserId as jest.Mock).mockResolvedValue(
      Result.fail(error)
    );

    const result = await query.execute({ userId });

    expect(result.isFail).toBe(true);
    expect(result.getError()?.message).toBe('User not found');
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to resolve user to customer',
      { userId, error: 'User not found' }
    );
  });

  it('should handle repository exceptions', async () => {
    const userId = 'user-123';
    const error = new Error('Database connection failed');

    (userRepository.findCustomerIdByUserId as jest.Mock).mockRejectedValue(
      error
    );

    const result = await query.execute({ userId });

    expect(result.isFail).toBe(true);
    expect(result.getError()?.message).toContain(
      'Failed to get user customer ID'
    );
    expect(logger.error).toHaveBeenCalledWith(
      'GetUserCustomerId query failed',
      { error: 'Database connection failed' }
    );
  });

  it('should handle non-Error exceptions', async () => {
    const userId = 'user-123';

    (userRepository.findCustomerIdByUserId as jest.Mock).mockRejectedValue(
      'unexpected string error'
    );

    const result = await query.execute({ userId });

    expect(result.isFail).toBe(true);
    expect(result.getError()?.message).toContain(
      'Failed to get user customer ID'
    );
  });
});
