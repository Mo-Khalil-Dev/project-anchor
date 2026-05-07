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
    mandate: {
      findFirst: jest.fn(),
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

  let customerRepository: any;
  let bankConnectionRepository: any;
  let assessmentRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    customerRepository = { findById: jest.fn() };
    bankConnectionRepository = { findByCustomerId: jest.fn() };
    assessmentRepository = { findLatestByCustomerId: jest.fn() };
  });

  // Journey: User not linked to customer
  it('returns ACCOUNT_SETUP when user is not linked to customer', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: null });
    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toEqual({
      accountSetup: null,
      bankConnection: null,
      assessment: null,
      mandate: null,
      paymentPlans: [],
      nextStep: 'ACCOUNT_SETUP',
    });
  });

  // Error: User not found
  it('fails when user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-404' });

    expect(result.isFail).toBe(true);
    expect(result.getError()?.message).toBe('User not found');
    expect(logger.warn).toHaveBeenCalled();
  });

  // Journey: Account setup completed, awaiting bank connection
  it('returns BANK_CONNECTION after account setup completed', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok(null) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(Result.ok(null) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('BANK_CONNECTION');
    expect(result.getOrThrow().accountSetup?.status).toBe('COMPLETED');
    expect(result.getOrThrow().bankConnection).toBeNull();
  });

  // Journey: Account setup in progress
  it('returns ACCOUNT_SETUP_LOADING when account setup in progress', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'IN_PROGRESS' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok(null) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(Result.ok(null) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('ACCOUNT_SETUP_LOADING');
  });

  // Journey: Bank connection in progress
  it('returns BANK_CONNECTION when bank connection in progress', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'IN_PROGRESS' }) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(Result.ok(null) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('BANK_CONNECTION');
  });

  // Journey: Bank connected, awaiting assessment
  it('returns ASSESSMENT after bank connection completed', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(Result.ok(null) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('ASSESSMENT');
    expect(result.getOrThrow().bankConnection?.status).toBe('CONNECTED');
  });

  // Journey: Assessment calculating
  it('returns ASSESSMENT_CALCULATING when assessment is pending', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    (prisma.mandate.findFirst as jest.Mock).mockResolvedValue(null);
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest
      .spyOn(GetAssessmentQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'PENDING' }) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('ASSESSMENT_CALCULATING');
  });

  // Journey: Assessment in progress
  it('returns ASSESSMENT_CALCULATING when assessment is in progress', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    (prisma.mandate.findFirst as jest.Mock).mockResolvedValue(null);
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest
      .spyOn(GetAssessmentQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'IN_PROGRESS' }) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('ASSESSMENT_CALCULATING');
  });

  // Journey: Assessment completed, no mandate yet
  it('returns DIRECT_DEBIT_SETUP when assessment completed without mandate', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    (prisma.mandate.findFirst as jest.Mock).mockResolvedValue(null);
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest
      .spyOn(GetAssessmentQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED', paymentPlans: [] }) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('DIRECT_DEBIT_SETUP');
    expect(result.getOrThrow().mandate).toBeNull();
  });

  // Journey: Assessment completed, mandate pending
  it('returns DIRECT_DEBIT_PENDING when mandate is pending', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    (prisma.mandate.findFirst as jest.Mock).mockResolvedValue({
      id: 'mandate-1',
      status: 'PENDING',
      gocardlessId: null,
      createdAt: new Date('2026-05-01'),
    });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest
      .spyOn(GetAssessmentQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('DIRECT_DEBIT_PENDING');
    expect(result.getOrThrow().mandate?.status).toBe('PENDING');
  });

  // Journey: Assessment + mandate active
  it('returns PAYMENT_PLANS when mandate is active', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    (prisma.mandate.findFirst as jest.Mock).mockResolvedValue({
      id: 'mandate-1',
      status: 'ACTIVE',
      gocardlessId: 'gc-123',
      createdAt: new Date('2026-05-01'),
    });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(
      Result.ok({
        status: 'COMPLETED',
        paymentPlans: [{ type: 'Balanced', monthlyAmount: 120 }],
      }) as any
    );

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('PAYMENT_PLANS');
    expect(result.getOrThrow().paymentPlans).toEqual([{ type: 'Balanced', monthlyAmount: 120 }]);
  });

  // Journey: Assessment + mandate created
  it('returns PAYMENT_PLANS when mandate is created', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    (prisma.mandate.findFirst as jest.Mock).mockResolvedValue({
      id: 'mandate-1',
      status: 'CREATED',
      gocardlessId: 'gc-123',
      createdAt: new Date('2026-05-01'),
    });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest
      .spyOn(GetAssessmentQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow().nextStep).toBe('PAYMENT_PLANS');
  });

  // Edge case: Query failures handled gracefully
  it('treats query failures as null values (graceful degradation)', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.fail(new Error('DB error')) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.fail(new Error('DB error')) as any);
    jest
      .spyOn(GetAssessmentQuery.prototype, 'execute')
      .mockResolvedValue(Result.fail(new Error('DB error')) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isOk).toBe(true);
    const data = result.getOrThrow();
    expect(data.accountSetup).toBeNull();
    expect(data.bankConnection).toBeNull();
    expect(data.assessment).toBeNull();
    expect(data.nextStep).toBe('ACCOUNT_SETUP');
  });

  // Edge case: Mandate fetched only when assessment exists
  it('does not fetch mandate when assessment does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'CONNECTED' }) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(Result.ok(null) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    await useCase.execute({ userId: 'user-1' });

    expect(prisma.mandate.findFirst).not.toHaveBeenCalled();
  });

  // Error: Unexpected exception
  it('handles unexpected exceptions', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database connection lost'));

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isFail).toBe(true);
    expect(result.getError()?.message).toContain('Failed to get reference data');
    expect(logger.error).toHaveBeenCalled();
  });

  // Logging verification
  it('logs appropriate messages throughout journey', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ customerId: 'customer-1' });
    jest
      .spyOn(GetAccountSetupQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok({ status: 'COMPLETED' }) as any);
    jest
      .spyOn(GetBankConnectionQuery.prototype, 'execute')
      .mockResolvedValue(Result.ok(null) as any);
    jest.spyOn(GetAssessmentQuery.prototype, 'execute').mockResolvedValue(Result.ok(null) as any);

    const useCase = new GetReferenceDataUseCase(
      customerRepository,
      bankConnectionRepository,
      assessmentRepository,
      logger
    );

    await useCase.execute({ userId: 'user-1' });

    expect(logger.info).toHaveBeenCalledWith(
      'Starting reference data fetch',
      expect.objectContaining({ userId: 'user-1' })
    );
    expect(logger.info).toHaveBeenCalledWith('Resolved userId to customerId', expect.any(Object));
    expect(logger.info).toHaveBeenCalledWith('Determined next step', expect.any(Object));
  });
});
