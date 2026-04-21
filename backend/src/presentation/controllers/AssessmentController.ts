import { Request, Response } from 'express';
import type { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import type { ILogger } from '../../shared/logging';

export class AssessmentController {
  constructor(private assessmentRepository: IAssessmentRepository, private logger: ILogger) {}

  async getAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { assessmentId } = req.params;

      if (!assessmentId) {
        res.status(400).json({ error: 'Assessment ID is required' });
        return;
      }

      const result = await this.assessmentRepository.findById(assessmentId);

      if (result.isFail) {
        this.logger.error('Failed to fetch assessment', {
          assessmentId,
          error: result.getError()?.message,
        });
        res.status(500).json({ error: 'Failed to fetch assessment' });
        return;
      }

      const assessment = result.getOrThrow();

      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      const response = {
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
        calculatedAt: assessment.getUpdatedAt().toISOString(),
      };

      if (assessment.getStatus() === 'PENDING') {
        res.status(200).json({
          ...response,
          message: 'Assessment is still calculating. Please check back shortly.',
        });
        return;
      }

      if (assessment.getStatus() === 'FAILED') {
        res.status(200).json({
          ...response,
          message: 'Assessment calculation failed. Please contact support.',
        });
        return;
      }

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Assessment controller error', { error: message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
