import { Result } from '../../../../shared/result';
import type { ILogger } from '../../../../shared/logging';
import { BankDataExtractionService } from '../../../../bankConnection/services/BankDataExtractionService';
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

  const prisma = {
    assessmentJob: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bankReports: {
      findUnique: jest.fn(),
    },
  } as any;

  const assessmentRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  } as any;

  const completeAssessmentUseCase = {
    execute: jest.fn(),
  } as any;

  const failAssessmentUseCase = {
    execute: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns failed result when job does not exist', async () => {
    prisma.assessmentJob.findUnique.mockResolvedValue(null);
    const job = new ProcessAssessmentJob(
      prisma,
      assessmentRepository,
      logger,
      completeAssessmentUseCase,
      failAssessmentUseCase,
    );

    const result = await job.execute('job-404');

    expect(result.isFail).toBe(true);
    expect(result.getError()).toEqual(new Error('Assessment job not found: job-404'));
    expect(logger.error).toHaveBeenCalled();
  });

  it('processes job successfully and marks it SUCCESS', async () => {
    prisma.assessmentJob.findUnique.mockResolvedValue({
      id: 'job-1',
      assessmentId: 'assessment-1',
    });
    assessmentRepository.findById.mockResolvedValue(Result.ok(buildAssessment()));
    prisma.bankReports.findUnique.mockResolvedValue({
      incomeJson: '{"ok":true}',
      expensesJson: '{"ok":true}',
    });
    assessmentRepository.update.mockResolvedValue(Result.ok(buildAssessment()));
    completeAssessmentUseCase.execute.mockResolvedValue(Result.ok({
      assessmentId: 'assessment-1',
      status: 'COMPLETED',
      hardshipLevel: 'MODERATE',
      disposableIncome: 700,
    }));
    jest.spyOn(BankDataExtractionService, 'extractIncome').mockReturnValue(
      Result.ok({
        salary: 2500,
        benefits: 100,
        pension: 0,
        other: 0,
        total: 2600,
      }) as any,
    );
    jest.spyOn(BankDataExtractionService, 'extractExpenses').mockReturnValue(
      Result.ok({
        housing: 1000,
        food: 400,
        transport: 200,
        utilities: 180,
        other: 120,
        total: 1900,
      }) as any,
    );
    const job = new ProcessAssessmentJob(
      prisma,
      assessmentRepository,
      logger,
      completeAssessmentUseCase,
      failAssessmentUseCase,
    );

    const result = await job.execute('job-1');

    expect(result.isOk).toBe(true);
    expect(assessmentRepository.update).toHaveBeenCalled();
    expect(completeAssessmentUseCase.execute).toHaveBeenCalledWith({
      assessmentId: 'assessment-1',
    });
    expect(prisma.assessmentJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: expect.objectContaining({ status: 'SUCCESS' }),
      }),
    );
  });
});
