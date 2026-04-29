import { Request, Response } from 'express';
import type { IAssessmentRepository } from '../types/assessment.types';
import type { ILogger } from '../../shared/logging';

export class AssessmentController {
  constructor(private assessmentRepository: IAssessmentRepository, private logger: ILogger) {}

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
}
