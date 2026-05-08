import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import { TinkResponseParser } from '@/features/bankConnection/infrastructure/services/Tink/TinkResponseParser';
import { Assessment } from '@/features/assessment/domain/entities';
import { ASSESSMENT_STATUS } from '@/features/assessment/domain/entities/assessment-status';
import { ProcessAssessmentJob } from './ProcessAssessmentJob';

const buildAssessment = () =>
  Assessment.reconstruct({
    id: 'assessment-1',
    customerId: 'customer-1',
    bankConnectionId: 'bank-1',
    monthlyIncome: 2500,
    monthlyExpenses: 1800,
    monthlyBill: 100,
    arrears: 400,
    incomeBreakdown: null,
    expenseBreakdown: null,
    expensesByCategory: null,
    incomeHistory: JSON.stringify([]),
    incomeSources: null,
    factors: JSON.stringify([]),
    paymentPlans: null,
    selectedPlan: null,
    status: ASSESSMENT_STATUS.PENDING,
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
  });

describe('ProcessAssessmentJob', () => {
  const logger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const bankReportRepository = {
    findByBankConnectionIdOrThrow: jest.fn(),
  } as any;

  const assessmentRepository = {
    findByIdOrThrow: jest.fn(),
    update: jest.fn(),
  } as any;

  const failAssessmentUseCase = {
    execute: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns failed result when assessment does not exist', async () => {
    assessmentRepository.findByIdOrThrow.mockRejectedValue(new Error('Assessment not found'));
    const job = new ProcessAssessmentJob(
      assessmentRepository,
      bankReportRepository,
      logger,
      failAssessmentUseCase
    );

    const result = await job.execute('assessment-404');

    expect(result.isFail).toBe(true);
    expect(result.getError()?.message).toContain('Assessment not found');
    expect(logger.error).toHaveBeenCalled();
  });

  it('processes assessment successfully and completes it', async () => {
    const assessment = buildAssessment();
    assessmentRepository.findByIdOrThrow.mockResolvedValue(assessment);
    bankReportRepository.findByBankConnectionIdOrThrow.mockResolvedValue({
      incomeJson: '{"salary":2500,"benefits":100,"pension":0,"other":0,"total":2600}',
      expensesJson:
        '{"housing":1000,"food":400,"transport":200,"utilities":180,"other":120,"total":1900}',
    });
    assessmentRepository.update.mockResolvedValue(Result.ok(assessment));
    jest.spyOn(TinkResponseParser, 'extractIncome').mockReturnValue(
      Result.ok({
        salary: 2500,
        benefits: 100,
        pension: 0,
        other: 0,
        total: 2600,
      }) as any
    );
    jest.spyOn(TinkResponseParser, 'extractExpenses').mockReturnValue(
      Result.ok({
        housing: 1000,
        food: 400,
        transport: 200,
        utilities: 180,
        other: 120,
        total: 1900,
      }) as any
    );
    const job = new ProcessAssessmentJob(
      assessmentRepository,
      bankReportRepository,
      logger,
      failAssessmentUseCase
    );

    const result = await job.execute('assessment-1');

    expect(result.isOk).toBe(true);
    expect(assessmentRepository.update).toHaveBeenCalled();
  });
});
