import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import { prisma } from '../../../shared/utils/db';
import { GetAccountSetupQuery } from './GetAccountSetupQuery';
import { GetBankConnectionQuery } from './GetBankConnectionQuery';
import { GetAssessmentQuery } from './GetAssessmentQuery';
import { GetReferenceDataUseCase } from './GetReferenceDataUseCase';

jest.mock('../../../shared/utils/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('GetReferenceDataUseCase', () => {
  const logger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const customerRepository = {} as any;
  const bankConnectionRepository = {} as any;
  const assessmentRepository = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns ACCOUNT_SETUP when user is not linked to customer', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: null });
    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toEqual({
      accountSetup: null,
      bankConnection: null,
      assessment: null,
      paymentPlans: [],
      nextStep: 'ACCOUNT_SETUP',
    });
  });

  it('returns PAYMENT_PLANS with plans when assessment is completed', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest.spyOn(GetAccountSetupQuery.prototype, 'execute').mockResolvedValue(
      Result.ok({
        status: 'COMPLETED',
      }) as any,
    );
    jest.spyOn(GetBankConnectionQuery.prototype, 'execute').mockResolvedValue(
      Result.ok({
        status: 'COMPLETED',
      }) as any,
    );
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(
      Result.ok({
        status: 'COMPLETED',
        paymentPlans: [{ type: 'Balanced', monthlyAmount: 120 }],
      }) as any,
    );
    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toMatchObject({
      nextStep: 'PAYMENT_PLANS',
      paymentPlans: [{ type: 'Balanced', monthlyAmount: 120 }],
    });
  });

  it('returns failure when user is missing', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger,
    );

    const result = await useCase.execute({ userId: 'user-404' });

    expect(result.isFail).toBe(true);
    expect(result.getError()).toEqual(new Error('User not found'));
  });
});
