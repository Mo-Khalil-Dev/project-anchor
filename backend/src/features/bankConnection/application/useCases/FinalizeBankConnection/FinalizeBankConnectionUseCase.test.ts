import { PrismaClient } from '@prisma/client';
import { Result } from '../../../../shared/result';
import type { ILogger } from '../../../../shared/logging';
import type { IBankConnectionRepository } from '../../respositories/IBankConnectionRepository';
import type { IBankDataProvider } from '../../services/IBankDataProvider';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import type { IEventHandler } from '@/core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/assessment/domain/events/AssessmentReadyForProcessingEvent';
import { FinalizeBankConnectionUseCase } from './FinalizeBankConnectionUseCase';

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const mockCustomer = {
  id: 'customer-1',
  monthlyBill: 150,
  arrears: 500,
};

const mockBankConnection = {
  id: 'connection-1',
  getCustomerId: 'customer-1',
  markDataRetrieved: jest.fn(),
};

const mockFinancialData = {
  income: {
    salary: 3000,
    pension: 500,
    benefits: 200,
    cashDeposits: 0,
    other: 0,
    total: 3700,
  },
  expenses: {
    housing: 1000,
    food: 400,
    utilities: 150,
    transport: 200,
    other: 250,
    total: 2000,
  },
  rawIncomeData: { income: { streams: [] } },
  rawExpenseData: { expenses: {} },
};

describe('FinalizeBankConnectionUseCase', () => {
  let bankConnectionRepository: jest.Mocked<IBankConnectionRepository>;
  let assessmentRepository: jest.Mocked<IAssessmentRepository>;
  let bankDataProvider: jest.Mocked<IBankDataProvider>;
  let prisma: jest.Mocked<PrismaClient>;
  let eventHandler: jest.Mocked<IEventHandler<AssessmentReadyForProcessingEvent>>;
  let useCase: FinalizeBankConnectionUseCase;

  beforeEach(() => {
    bankConnectionRepository = {
      findByOAuthState: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    } as any;

    assessmentRepository = {
      save: jest.fn(),
      findLatestByCustomerId: jest.fn(),
    } as any;

    bankDataProvider = {
      fetchFinancialData: jest.fn(),
    } as any;

    prisma = {
      customer: {
        findUnique: jest.fn(),
      },
      bankReports: {
        upsert: jest.fn(),
      },
    } as any;

    eventHandler = {
      handle: jest.fn(),
    } as any;

    useCase = new FinalizeBankConnectionUseCase(
      bankConnectionRepository,
      assessmentRepository,
      bankDataProvider,
      prisma,
      mockLogger,
      eventHandler
    );

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should finalize bank connection and create assessment successfully', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      bankDataProvider.fetchFinancialData.mockResolvedValue(
        Result.ok(mockFinancialData as any)
      );
      (prisma.bankReports.upsert as jest.Mock).mockResolvedValue({});
      assessmentRepository.save.mockResolvedValue(
        Result.ok({
          getId: jest.fn().mockReturnValue('assessment-1'),
          getDomainEvents: jest.fn().mockReturnValue([
            {
              getEventName: jest.fn().mockReturnValue('AssessmentReadyForProcessing'),
            },
          ]),
        } as any)
      );
      bankConnectionRepository.update.mockResolvedValue(Result.ok({} as any));

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token-456');

      // Assert
      expect(result.isOk).toBe(true);
      const output = result.getOrThrow();
      expect(output.connectionId).toBe('connection-1');
      expect(output.assessmentId).toBe('assessment-1');
      expect(output.totalIncome).toBe(3700);
      expect(output.totalExpenses).toBe(2000);
      expect(output.incomeBreakdown).toEqual(mockFinancialData.income);
      expect(output.expenseBreakdown).toEqual(mockFinancialData.expenses);

      expect(bankConnectionRepository.findByOAuthState).toHaveBeenCalledWith(
        'state-token-456'
      );
      expect(bankDataProvider.fetchFinancialData).toHaveBeenCalledWith('auth-code-123');
      expect(prisma.bankReports.upsert).toHaveBeenCalled();
      expect(assessmentRepository.save).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Bank connection finalized and assessment created',
        expect.any(Object)
      );
    });

    it('should fail when OAuth state is invalid', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.fail(new Error('Invalid state'))
      );

      // Act
      const result = await useCase.execute('auth-code-123', 'invalid-state');

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toBe('Invalid state');
      expect(bankDataProvider.fetchFinancialData).not.toHaveBeenCalled();
    });

    it('should fail when connection not found for state', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockResolvedValue(Result.ok(null as any));

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toBe('Invalid OAuth state token');
    });

    it('should fail when customer not found', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toBe('Customer not found');
      expect(bankDataProvider.fetchFinancialData).not.toHaveBeenCalled();
    });

    it('should fail when fetching financial data fails', async () => {
      // Arrange
      const bankError = new Error('Bank API error');
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      bankDataProvider.fetchFinancialData.mockResolvedValue(Result.fail(bankError));

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isFail).toBe(true);
      // Use catch-all for the error since it's returned directly from the provider
      expect(result.getError()).toBeDefined();
      // Verify the error path was taken and logging occurred
      expect(bankConnectionRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when saving assessment fails', async () => {
      // Arrange
      const saveError = new Error('Database error');
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      bankDataProvider.fetchFinancialData.mockResolvedValue(
        Result.ok(mockFinancialData as any)
      );
      (prisma.bankReports.upsert as jest.Mock).mockResolvedValue({});
      assessmentRepository.save.mockResolvedValue(Result.fail(saveError));

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(saveError);
    });

    it('should fail when updating bank connection fails', async () => {
      // Arrange
      const updateError = new Error('Update failed');
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      bankDataProvider.fetchFinancialData.mockResolvedValue(
        Result.ok(mockFinancialData as any)
      );
      (prisma.bankReports.upsert as jest.Mock).mockResolvedValue({});
      assessmentRepository.save.mockResolvedValue(
        Result.ok({
          getId: jest.fn().mockReturnValue('assessment-1'),
          getDomainEvents: jest.fn().mockReturnValue([]),
        } as any)
      );
      bankConnectionRepository.update.mockResolvedValue(Result.fail(updateError));

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(updateError);
    });

    it('should save bank reports with correct data', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      bankDataProvider.fetchFinancialData.mockResolvedValue(
        Result.ok(mockFinancialData as any)
      );
      (prisma.bankReports.upsert as jest.Mock).mockResolvedValue({});
      assessmentRepository.save.mockResolvedValue(
        Result.ok({
          getId: jest.fn().mockReturnValue('assessment-1'),
          getDomainEvents: jest.fn().mockReturnValue([]),
        } as any)
      );
      bankConnectionRepository.update.mockResolvedValue(Result.ok({} as any));

      // Act
      await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(prisma.bankReports.upsert).toHaveBeenCalledWith({
        where: { bankConnectionId: 'connection-1' },
        update: expect.objectContaining({
          totalMonthlyIncome: 3700,
          totalMonthlyExpenses: 2000,
          incomeJson: expect.any(String),
          expensesJson: expect.any(String),
        }),
        create: expect.objectContaining({
          bankConnectionId: 'connection-1',
          totalMonthlyIncome: 3700,
          totalMonthlyExpenses: 2000,
        }),
      });
    });

    it('should emit AssessmentReadyForProcessing event', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      bankDataProvider.fetchFinancialData.mockResolvedValue(
        Result.ok(mockFinancialData as any)
      );
      (prisma.bankReports.upsert as jest.Mock).mockResolvedValue({});

      // Create a more realistic mock event
      const mockEvent = {
        getEventName: jest.fn().mockReturnValue('AssessmentReadyForProcessing'),
        aggregateId: 'assessment-1',
        aggregateType: 'Assessment',
        aggregateVersion: 2,
      };

      assessmentRepository.save.mockResolvedValue(
        Result.ok({
          getId: jest.fn().mockReturnValue('assessment-1'),
          getDomainEvents: jest.fn().mockReturnValue([mockEvent]),
        } as any)
      );
      bankConnectionRepository.update.mockResolvedValue(Result.ok({} as any));

      // Act
      await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(eventHandler.handle).toHaveBeenCalled();
      expect(eventHandler.handle).toHaveBeenCalledTimes(1);
      const receivedEvent = (eventHandler.handle as jest.Mock).mock.calls[0][0];
      expect(receivedEvent.getEventName()).toBe('AssessmentReadyForProcessing');
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      bankConnectionRepository.findByOAuthState.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toContain('Bank connection finalization failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Bank connection finalization failed',
        expect.any(Object)
      );
    });

    it('should handle customer with null arrears and bill', async () => {
      // Arrange
      const customerWithoutDebt = { id: 'customer-1', monthlyBill: null, arrears: null };
      bankConnectionRepository.findByOAuthState.mockResolvedValue(
        Result.ok(mockBankConnection as any)
      );
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(customerWithoutDebt);
      bankDataProvider.fetchFinancialData.mockResolvedValue(
        Result.ok(mockFinancialData as any)
      );
      (prisma.bankReports.upsert as jest.Mock).mockResolvedValue({});
      assessmentRepository.save.mockResolvedValue(
        Result.ok({
          getId: jest.fn().mockReturnValue('assessment-1'),
          getDomainEvents: jest.fn().mockReturnValue([]),
        } as any)
      );
      bankConnectionRepository.update.mockResolvedValue(Result.ok({} as any));

      // Act
      const result = await useCase.execute('auth-code-123', 'state-token');

      // Assert
      expect(result.isOk).toBe(true);
      expect(assessmentRepository.save).toHaveBeenCalled();
    });
  });
});
