import { AssessmentController } from '../../../../src/presentation/controllers/AssessmentController';
import { Assessment } from '../../../../src/domain/entities/Assessment.entity';
import { Result } from '../../../../src/shared/result';
import type { IAssessmentRepository } from '../../../../src/domain/repositories/IAssessmentRepository';
import type { ILogger } from '../../../../src/shared/logging';

describe('AssessmentController', () => {
  let controller: AssessmentController;
  let mockRepository: jest.Mocked<IAssessmentRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      update: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    controller = new AssessmentController(mockRepository, mockLogger);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAssessment', () => {
    it('should return assessment when found', async () => {
      const assessment = new Assessment({
        id: 'assessment-1',
        customerId: 'customer-1',
        bankConnectionId: 'bank-1',
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
        monthlyBill: 100,
        arrears: 500,
        incomeBreakdown: JSON.stringify({
          salary: 3000,
          pension: 0,
          benefits: 0,
          cashDeposits: 0,
          other: 0,
          total: 3000,
        }),
        expenseBreakdown: JSON.stringify({
          housing: 700,
          food: 400,
          utilities: 300,
          transport: 400,
          other: 200,
          total: 2000,
        }),
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(Result.ok(assessment));
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRepository.findById).toHaveBeenCalledWith('assessment-1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'assessment-1',
          monthlyIncome: 3000,
          monthlyExpenses: 2000,
          disposableIncome: 1000,
          billRatio: 10,
          hardshipLevel: 'LOW',
          status: 'COMPLETED',
          incomeBreakdown: expect.objectContaining({
            salary: 3000,
            total: 3000,
          }),
          expenseBreakdown: expect.objectContaining({
            housing: 700,
            total: 2000,
          }),
        })
      );
    });

    it('should return 404 when assessment not found', async () => {
      mockRepository.findById.mockResolvedValue(Result.ok(null));
      mockReq = { params: { assessmentId: 'unknown' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Assessment not found',
      });
    });

    it('should return 400 when assessmentId is missing', async () => {
      mockReq = { params: {} };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Assessment ID is required',
      });
    });

    it('should return 500 when repository fails', async () => {
      mockRepository.findById.mockResolvedValue(
        Result.fail(new Error('Database error'))
      );
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to fetch assessment',
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should include breakdown data in response', async () => {
      const incomeData = {
        salary: 2500,
        pension: 500,
        benefits: 0,
        cashDeposits: 0,
        other: 0,
        total: 3000,
      };

      const expenseData = {
        housing: 800,
        food: 500,
        utilities: 200,
        transport: 300,
        other: 200,
        total: 2000,
      };

      const assessment = new Assessment({
        id: 'assessment-1',
        customerId: 'customer-1',
        bankConnectionId: 'bank-1',
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
        monthlyBill: 100,
        arrears: 500,
        incomeBreakdown: JSON.stringify(incomeData),
        expenseBreakdown: JSON.stringify(expenseData),
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(Result.ok(assessment));
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          incomeBreakdown: incomeData,
          expenseBreakdown: expenseData,
        })
      );
    });

    it('should handle null breakdown data', async () => {
      const assessment = new Assessment({
        id: 'assessment-1',
        customerId: 'customer-1',
        bankConnectionId: 'bank-1',
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
        monthlyBill: 100,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(Result.ok(assessment));
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          incomeBreakdown: null,
          expenseBreakdown: null,
        })
      );
    });

    it('should return PENDING status with message', async () => {
      const assessment = new Assessment({
        id: 'assessment-1',
        customerId: 'customer-1',
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyBill: 0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(Result.ok(assessment));
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING',
          message: 'Assessment is still calculating. Please check back shortly.',
        })
      );
    });

    it('should return FAILED status with message', async () => {
      const assessment = new Assessment({
        id: 'assessment-1',
        customerId: 'customer-1',
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyBill: 0,
        status: 'FAILED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(Result.ok(assessment));
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'FAILED',
          message:
            'Assessment calculation failed. Please contact support.',
        })
      );
    });

    it('should log errors appropriately', async () => {
      mockRepository.findById.mockResolvedValue(
        Result.fail(new Error('DB Error'))
      );
      mockReq = { params: { assessmentId: 'assessment-1' } };

      await controller.getAssessment(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch assessment',
        expect.objectContaining({
          assessmentId: 'assessment-1',
        })
      );
    });
  });
});
