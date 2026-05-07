import { SelectPaymentPlanUseCase } from '@/features/assessment/application/useCases/SelectPaymentPlanUseCase';
import { AuthenticatedRequest } from '@/features/shared/types/auth';
import type { Response } from 'express';

export class AssessmentController {
  constructor(private readonly selectPaymentPlanUseCase: SelectPaymentPlanUseCase) {}

  async selectPaymentPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assessmentId = req.params?.assessmentId || req.body?.assessmentId;
      const { planType } = req.body;

      if (!assessmentId || !planType) {
        res.status(400).json({ error: 'assessmentId and planType are required' });
        return;
      }

      const result = await this.selectPaymentPlanUseCase.execute({ assessmentId, planType });

      if (result.isOk) {
        const data = result.getOrThrow();
        res.status(200).json({ success: true, data });
      } else {
        const error = result.getError()!;
        const status = (error as any).statusCode ?? 500;
        res.status(status).json({ error: error.message });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `Internal server error: ${message}` });
    }
  }
}
