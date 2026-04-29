import { Request, Response } from 'express';
import type { IAssessmentRepository } from '../types/assessment.types';
import type { ILogger } from '../../shared/logging';
import type { GetCurrentAssessmentUseCase } from '../services/GetCurrentAssessmentUseCase';
import type { AssessmentDetailedDTO } from '../types/assessment.dto';
import type { AuthenticatedRequest } from '../../shared/middleware/authenticateRequest';

export class AssessmentController {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
    private getCurrentAssessmentUseCase?: GetCurrentAssessmentUseCase,
  ) {}

  async getAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { assessmentId } = req.params;

      if (!assessmentId) {
        res.status(400).json({ success: false, error: 'Assessment ID is required' });
        return;
      }

      const result = await this.assessmentRepository.findById(assessmentId);

      if (result.isFail) {
        this.logger.error('Failed to fetch assessment', {
          assessmentId,
          error: result.getError()?.message,
        });
        res.status(500).json({ success: false, error: 'Failed to fetch assessment' });
        return;
      }

      const assessment = result.getOrThrow();

      if (!assessment) {
        res.status(404).json({ success: false, error: 'Assessment not found' });
        return;
      }

      const incomeBreakdown = assessment.getIncomeBreakdown()
        ? JSON.parse(assessment.getIncomeBreakdown()!)
        : null;
      const expenseBreakdown = assessment.getExpenseBreakdown()
        ? JSON.parse(assessment.getExpenseBreakdown()!)
        : null;

      res.status(200).json({
        success: true,
        data: {
          id: assessment.getId(),
          customerId: assessment.getCustomerId(),
          bankConnectionId: assessment.getBankConnectionId(),
          monthlyIncome: assessment.getMonthlyIncome(),
          monthlyExpenses: assessment.getMonthlyExpenses(),
          disposableIncome: assessment.calculateDisposableIncome(),
          monthlyBill: assessment.getMonthlyBill(),
          billRatio: assessment.calculateBillRatio(),
          hardshipLevel: assessment.getHardshipLevel(),
          sustainabilityScore: assessment.getSustainabilityScore(),
          status: assessment.getStatus(),
          arrears: assessment.getArrears(),
          incomeBreakdown,
          expenseBreakdown,
          calculatedAt: assessment.getUpdatedAt().toISOString(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Assessment controller error', { error: message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getCurrentAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!this.getCurrentAssessmentUseCase) {
        res.status(500).json({ success: false, error: 'Use case not initialized' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const result = await this.getCurrentAssessmentUseCase.execute({ userId });

      if (result.isFail) {
        this.logger.error('Failed to fetch current assessment', {
          userId,
          error: result.getError()?.message,
        });
        res.status(500).json({ success: false, error: 'Failed to fetch assessment' });
        return;
      }

      const assessment = result.getOrElse(null);

      if (!assessment) {
        res.status(404).json({ success: false, error: 'No assessment found for this customer' });
        return;
      }

      const dto: AssessmentDetailedDTO = {
        id: assessment.getId(),
        customerId: assessment.getCustomerId(),
        hardshipLevel: assessment.getHardshipLevel(),
        disposableIncome: assessment.calculateDisposableIncome(),
        billRatio: assessment.calculateBillRatio(),
        monthlyBill: assessment.getMonthlyBill(),
        monthlyIncome: assessment.getMonthlyIncome(),
        monthlyExpenses: assessment.getMonthlyExpenses(),
        arrears: assessment.getArrears() || 0,
        expensesByCategory: assessment.getExpensesByCategory()
          ? JSON.parse(assessment.getExpensesByCategory()!)
          : {},
        incomeHistory: assessment.getIncomeHistory()
          ? JSON.parse(assessment.getIncomeHistory()!)
          : [],
        incomeSources: assessment.getIncomeSources()
          ? JSON.parse(assessment.getIncomeSources()!)
          : [],
        factors: assessment.getFactors() ? JSON.parse(assessment.getFactors()!) : [],
        paymentPlans: assessment.getPaymentPlans()
          ? JSON.parse(assessment.getPaymentPlans()!)
          : [],
        createdAt: assessment.getCreatedAt().toISOString(),
        updatedAt: assessment.getUpdatedAt().toISOString(),
        status: assessment.getStatus(),
      };

      res.status(200).json({
        success: true,
        data: dto,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('getCurrentAssessment controller error', { error: message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
