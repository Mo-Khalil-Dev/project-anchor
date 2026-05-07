import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import { Assessment } from '@/features/assessment/domain/entities';
import { ASSESSMENT_STATUS } from '@/features/assessment/domain/entities/assessment-status';
import { GetAssessmentQuery } from './GetAssessmentQuery';
import {
  AssessmentRepositoryQueryError,
  GetAssessmentQueryExecutionError,
} from '@/features/assessment/application/errors/GetAssessmentQuery.errors';

const createAssessmentProps = () => ({
  id: 'assessment-1',
  customerId: 'customer-1',
  bankConnectionId: 'bank-1',
  monthlyIncome: 3000,
  monthlyExpenses: 2200,
  monthlyBill: 120,
  arrears: 500,
  incomeBreakdown: JSON.stringify({ salary: 2800, benefits: 200, total: 3000 }),
  expenseBreakdown: JSON.stringify({ housing: 1000, food: 400, total: 2200 }),
  expensesByCategory: JSON.stringify({ Housing: 1000, Food: 400 }),
  incomeSources: JSON.stringify([{ type: 'Salary', amount: 2800 }]),
  incomeHistory: JSON.stringify([{ month: 'Jan', amount: 3000 }]),
  factors: JSON.stringify([{ title: 'High rent' }]),
  paymentPlans: JSON.stringify([{ type: 'Balanced', monthlyAmount: 144 }]),
  selectedPlan: null,
  status: ASSESSMENT_STATUS.COMPLETED,
  createdAt: new Date('2026-04-10T00:00:00.000Z'),
  updatedAt: new Date('2026-04-10T00:00:00.000Z'),
});

const createAssessment = () => Assessment.reconstruct(createAssessmentProps());

describe('GetAssessmentQuery', () => {
  const logger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const repository = {
    findLatestByCustomerId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped assessment data when repository succeeds', async () => {
    repository.findLatestByCustomerId.mockResolvedValue(Result.ok(createAssessment()));
    const query = new GetAssessmentQuery(repository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isOk).toBe(true);
    const data = result.getOrThrow();
    expect(data?.id).toBe('assessment-1');
    expect(data?.status).toBe('COMPLETED');
    expect(data?.expensesByCategory).toEqual({ Housing: 1000, Food: 400 });
    expect(data?.paymentPlans).toEqual([{ type: 'Balanced', monthlyAmount: 144 }]);
  });

  it('returns ok(null) when no assessment exists', async () => {
    repository.findLatestByCustomerId.mockResolvedValue(Result.ok(null));
    const query = new GetAssessmentQuery(repository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toBeNull();
  });

  it('returns failed result when repository returns failure', async () => {
    repository.findLatestByCustomerId.mockResolvedValue(Result.fail(new Error('db down')));
    const query = new GetAssessmentQuery(repository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isFail).toBe(true);
    expect(result.getError()).toBeInstanceOf(AssessmentRepositoryQueryError);
    expect(result.getError()).toMatchObject({
      code: 'ASSESSMENT_REPOSITORY_QUERY_FAILED',
      message: 'Failed to fetch assessment data',
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('returns execution typed error when repository throws unexpectedly', async () => {
    repository.findLatestByCustomerId.mockRejectedValue(new Error('db exploded'));
    const query = new GetAssessmentQuery(repository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isFail).toBe(true);
    expect(result.getError()).toBeInstanceOf(GetAssessmentQueryExecutionError);
    expect(result.getError()).toMatchObject({
      code: 'GET_ASSESSMENT_QUERY_EXECUTION_FAILED',
    });
  });

  it('falls back to defaults when JSON parsing fails', async () => {
    const brokenAssessment = Assessment.reconstruct({
      ...createAssessmentProps(),
      expensesByCategory: '{invalid json',
      incomeSources: '{invalid json',
      incomeHistory: '{invalid json',
      factors: '{invalid json',
      paymentPlans: '{invalid json',
    });
    repository.findLatestByCustomerId.mockResolvedValue(Result.ok(brokenAssessment));
    const query = new GetAssessmentQuery(repository as any, logger);

    const result = await query.execute({ customerId: 'customer-1' });

    expect(result.isOk).toBe(true);
    expect(result.getOrThrow()).toMatchObject({
      expensesByCategory: {},
      incomeSources: [],
      incomeHistory: [],
      factors: [],
      paymentPlans: [],
    });
    expect(logger.warn).toHaveBeenCalledTimes(5);
  });
});
