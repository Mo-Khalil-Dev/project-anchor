import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import { GetBankConnectionQuery } from './GetBankConnectionQuery';

describe('GetBankConnectionQuery', () => {
  const logger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const bankConnectionRepository = {
    findByCustomerId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps DATA_RETRIEVED to CONNECTED', async () => {
    bankConnectionRepository.findByCustomerId.mockResolvedValue(
      Result.ok({
        getStatus: 'DATA_RETRIEVED',
        getConnectedAt: new Date('2026-05-01T00:00:00.000Z'),
      })
    );
    const query = new GetBankConnectionQuery(bankConnectionRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toEqual({
      status: 'CONNECTED',
      bankName: null,
      accountNumber: null,
      connectedAt: '2026-05-01T00:00:00.000Z',
    });
  });

  it('maps PENDING to IN_PROGRESS', async () => {
    bankConnectionRepository.findByCustomerId.mockResolvedValue(
      Result.ok({
        getStatus: 'PENDING',
        getConnectedAt: null,
      })
    );
    const query = new GetBankConnectionQuery(bankConnectionRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toMatchObject({
      status: 'IN_PROGRESS',
      connectedAt: null,
    });
  });

  it('returns ok(null) when no bank connection exists', async () => {
    bankConnectionRepository.findByCustomerId.mockResolvedValue(Result.ok(null));
    const query = new GetBankConnectionQuery(bankConnectionRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-404' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toBeNull();
  });

  it('returns fail when repository returns failure', async () => {
    bankConnectionRepository.findByCustomerId.mockResolvedValue(Result.fail(new Error('db down')));
    const query = new GetBankConnectionQuery(bankConnectionRepository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isFail).toBe(true);
    expect(result.getError()).toEqual(new Error('Failed to fetch bank connection data'));
    expect(logger.error).toHaveBeenCalled();
  });
});
