import type { ILogger } from '../../../../shared/logging';
import { Assessment } from '@/features/assessment/domain/entities';
import { ASSESSMENT_STATUS } from '@/features/assessment/domain/entities/assessment-status';
import { prisma } from '../../../../shared/utils/db';
import { PrismaAssessmentRepository } from './PrismaAssessmentRepository';

jest.mock('../../../../shared/utils/db', () => ({
  prisma: {
    assessment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const buildRecord = () => ({
  id: 'assessment-1',
  customerId: 'customer-1',
  bankConnectionId: 'bank-1',
  monthlyIncome: 3000,
  monthlyExpenses: 2100,
  monthlyBill: 120,
  arrears: 500,
  incomeBreakdown: null,
  expenseBreakdown: null,
  expensesByCategory: null,
  incomeHistory: null,
  incomeSources: null,
  factors: null,
  paymentPlans: null,
  selectedPlan: null,
  status: ASSESSMENT_STATUS.PENDING,
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  updatedAt: new Date('2026-04-01T00:00:00.000Z'),
});

describe('PrismaAssessmentRepository', () => {
  const mockLogger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const repository = new PrismaAssessmentRepository(prisma, mockLogger);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves and maps assessment from prisma', async () => {
    const assessment = Assessment.reconstruct(buildRecord());
    (prisma.assessment.create as jest.Mock).mockResolvedValue(buildRecord());

    const result = await repository.save(assessment);

    expect(result.isOk).toBe(true);
    expect(prisma.assessment.create).toHaveBeenCalled();
    expect(result.getOrThrow().getId()).toBe('assessment-1');
  });

  it('returns null when findById does not find record', async () => {
    (prisma.assessment.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.findById('missing-id');

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toBeNull();
  });

  it('returns latest assessment by customer id', async () => {
    (prisma.assessment.findFirst as jest.Mock).mockResolvedValue(buildRecord());

    const result = await repository.findLatestByCustomerId('customer-1');

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()?.getCustomerId()).toBe('customer-1');
  });

  it('updates selected plan', async () => {
    (prisma.assessment.update as jest.Mock).mockResolvedValue({});

    const result = await repository.updateSelectedPlan('assessment-1', 'BALANCED' as any);

    expect(result.isOk).toBe(true);
    expect(prisma.assessment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'assessment-1' },
        data: expect.objectContaining({ selectedPlan: 'BALANCED' }),
      }),
    );
  });
});
