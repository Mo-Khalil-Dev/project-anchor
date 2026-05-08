import { SelectPlanUseCase } from '@/features/assessment/application/useCases/SelectPlanUseCase';
import { AuthenticatedRequest } from '@/features/shared/types/auth';
import type { ILogger } from '@/features/shared/logging';
import type { Response } from 'express';
import type { PlanType } from '@/features/assessment/domain/entities';

export class AssessmentController {
  constructor(
    private readonly selectPlanUseCase: SelectPlanUseCase,
    private readonly logger: ILogger
  ) {}

  /**
   * POST /api/assessments/select-plan
   * Body: { planType: 'Conservative' | 'Balanced' | 'Aggressive' }
   * Persists the customer's chosen payment plan on their latest assessment.
   */
  async selectPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { planType } = req.body as { planType?: PlanType };
      if (!planType) {
        res.status(400).json({ success: false, error: 'planType is required' });
        return;
      }

      const result = await this.selectPlanUseCase.execute({ userId, planType });

      if (result.isFail) {
        const error = result.getError();
        const message = error?.message || 'Failed to select plan';
        this.logger.warn('Failed to select plan', { userId, planType, error: message });
        res.status(400).json({ success: false, error: message });
        return;
      }

      const output = result.getOrThrow();
      res.status(200).json({ success: true, data: output });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('selectPlan controller error', { error: message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
