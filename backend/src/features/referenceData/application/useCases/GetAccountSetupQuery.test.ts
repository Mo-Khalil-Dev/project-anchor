import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import { GetAccountSetupQuery } from './GetAccountSetupQuery';

describe('GetAccountSetupQuery', () => {
  const logger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const customerRepository = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns account setup data when customer exists and is complete', async () => {
    customerRepository.findById.mockResolvedValue(
      Result.ok({
        id: 'customer-1',
        utilityType: 'WATER',
        utilityAccountNo: 'UTIL-123',
        postcode: 'SW1A 1AA',
        createdAt: new Date('2026-04-10T00:00:00.000Z'),
      }),
    );
    const query = new GetAccountSetupQuery(customerRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toEqual({
      status: 'COMPLETED',
      customerId: 'customer-1',
      utility: 'WATER',
      postcode: 'SW1A 1AA',
      lastCompletedAt: '2026-04-10T00:00:00.000Z',
    });
  });

  it('returns ok(null) when customer does not exist', async () => {
    customerRepository.findById.mockResolvedValue(Result.ok(null));
    const query = new GetAccountSetupQuery(customerRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-404' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toBeNull();
  });

  it('returns fail when repository returns failure', async () => {
    customerRepository.findById.mockResolvedValue(Result.fail(new Error('db down')));
    const query = new GetAccountSetupQuery(customerRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isFail).toBe(true);
    expect(result.getError()).toEqual(new Error('Failed to fetch account setup data'));
    expect(logger.error).toHaveBeenCalled();
  });

  it('returns fail when customer has missing utility account details', async () => {
    customerRepository.findById.mockResolvedValue(
      Result.ok({
        id: 'customer-1',
        utilityType: 'ELECTRICITY',
        utilityAccountNo: null,
        postcode: 'SW1A 1AA',
        createdAt: new Date('2026-04-10T00:00:00.000Z'),
      }),
    );
    const query = new GetAccountSetupQuery(customerRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isFail).toBe(true);
    expect(result.getError()).toEqual(new Error('Account data is incomplete. Please contact support.'));
    expect(logger.warn).toHaveBeenCalled();
  });
});
