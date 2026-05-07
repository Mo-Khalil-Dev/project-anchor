import { Result } from '../../../../shared/result';
import type { ILogger } from '../../../../shared/logging';
import type { IBankConnectionRepository } from '../../respositories/IBankConnectionRepository';
import type { ICustomerRepository } from '../../../../customer/types/customer.types';
import type { TinkApiClient } from '@/features/bankConnection/infrastructure/services/Tink/TinkApiClient';
import { InitiateBankConnectionUseCase } from './InitiateBankConnectionUseCase';

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const mockCustomer = {
  id: 'customer-1',
  email: 'john@example.com',
  monthlyBill: 150,
  arrears: 500,
  postcode: 'SW1A 1AA',
  utilityType: 'ELECTRICITY',
  linkedAt: new Date('2026-05-01'),
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
};

describe('InitiateBankConnectionUseCase', () => {
  let bankConnectionRepository: jest.Mocked<IBankConnectionRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let tinkService: jest.Mocked<TinkApiClient>;
  let useCase: InitiateBankConnectionUseCase;

  beforeEach(() => {
    bankConnectionRepository = {
      save: jest.fn(),
      findByOAuthState: jest.fn(),
      update: jest.fn(),
    } as any;

    customerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    tinkService = {
      generateAuthorizationUrl: jest.fn(),
      exchangeCodeForAccessToken: jest.fn(),
      getExpenseCheck: jest.fn(),
      getIncomeReport: jest.fn(),
    } as any;

    useCase = new InitiateBankConnectionUseCase(
      bankConnectionRepository,
      customerRepository,
      tinkService,
      mockLogger
    );

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should initiate bank connection successfully', async () => {
      // Arrange
      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer as any));
      bankConnectionRepository.save.mockResolvedValue(Result.ok({} as any));
      tinkService.generateAuthorizationUrl.mockReturnValue('https://link.tink.com/auth');

      // Act
      const result = await useCase.execute({ customerId: 'customer-1' });

      // Assert
      expect(result.isOk).toBe(true);
      const output = result.getOrThrow();
      expect(output.authUrl).toBe('https://link.tink.com/auth');
      expect(output.state).toBeDefined();
      expect(output.state).toHaveLength(64); // randomBytes(32).toString('hex') = 64 chars

      expect(customerRepository.findById).toHaveBeenCalledWith('customer-1');
      expect(bankConnectionRepository.save).toHaveBeenCalled();
      expect(tinkService.generateAuthorizationUrl).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'OAuth flow initiated',
        expect.objectContaining({
          customerId: 'customer-1',
          email: 'john@example.com',
        })
      );
    });

    it('should fail when customer is not found', async () => {
      // Arrange
      customerRepository.findById.mockResolvedValue(
        Result.fail(new Error('Customer not found'))
      );

      // Act
      const result = await useCase.execute({ customerId: 'nonexistent' });

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toBe('Customer not found');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch customer',
        expect.any(Object)
      );
      expect(bankConnectionRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when repository returns null customer', async () => {
      // Arrange
      customerRepository.findById.mockResolvedValue(Result.ok(null as any));

      // Act
      const result = await useCase.execute({ customerId: 'customer-1' });

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toBe('Customer not found');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Customer not found',
        expect.any(Object)
      );
    });

    it('should fail when saving bank connection fails', async () => {
      // Arrange
      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer as any));
      bankConnectionRepository.save.mockResolvedValue(
        Result.fail(new Error('Database error'))
      );

      // Act
      const result = await useCase.execute({ customerId: 'customer-1' });

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toBe('Database error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save bank connection',
        expect.any(Object)
      );
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      customerRepository.findById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await useCase.execute({ customerId: 'customer-1' });

      // Assert
      expect(result.isFail).toBe(true);
      expect(result.getError()?.message).toContain('OAuth initiation failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'OAuth initiation failed',
        expect.any(Object)
      );
    });

    it('should generate different states for each call', async () => {
      // Arrange
      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer as any));
      bankConnectionRepository.save.mockResolvedValue(Result.ok({} as any));
      tinkService.generateAuthorizationUrl.mockReturnValue('https://link.tink.com/auth');

      // Act
      const result1 = await useCase.execute({ customerId: 'customer-1' });
      const result2 = await useCase.execute({ customerId: 'customer-1' });

      // Assert
      const state1 = result1.getOrThrow().state;
      const state2 = result2.getOrThrow().state;
      expect(state1).not.toBe(state2);
    });

    it('should pass customer id to Tink service', async () => {
      // Arrange
      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer as any));
      bankConnectionRepository.save.mockResolvedValue(Result.ok({} as any));
      tinkService.generateAuthorizationUrl.mockReturnValue('https://link.tink.com/auth');

      // Act
      await useCase.execute({ customerId: 'customer-1' });

      // Assert
      expect(tinkService.generateAuthorizationUrl).toHaveBeenCalledWith(
        expect.any(String),
        'customer-1'
      );
    });
  });
});
