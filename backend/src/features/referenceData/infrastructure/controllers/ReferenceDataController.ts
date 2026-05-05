import type { Request, Response } from 'express';
import type { GetReferenceDataUseCase } from '../../application/useCases/GetReferenceDataUseCase';
import type { CompleteAssessmentUseCase } from '../../application/useCases/CompleteAssessmentUseCase';
import type { FailAssessmentUseCase } from '../../application/useCases/FailAssessmentUseCase';
import type { SelectPaymentPlanUseCase } from '../../application/useCases/SelectPaymentPlanUseCase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export class ReferenceDataController {
  constructor(
    private getReferenceDataUseCase: GetReferenceDataUseCase,
    private completeAssessmentUseCase: CompleteAssessmentUseCase,
    private failAssessmentUseCase: FailAssessmentUseCase,
    private selectPaymentPlanUseCase: SelectPaymentPlanUseCase,
  ) {}

  async getReferenceData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id ?? '';

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.getReferenceDataUseCase.execute({ userId });

      if (result.isFail) {
        const error = result.getError();
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(400).json({ error: errorMessage });
        return;
      }

      const data = result.getOrElse({} as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `Internal server error: ${message}` });
    }
  }

  async completeAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assessmentId = req.params?.assessmentId || req.body?.assessmentId;

      if (!assessmentId) {
        res.status(400).json({ error: 'assessmentId is required' });
        return;
      }

      const result = await this.completeAssessmentUseCase.execute({ assessmentId });

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

  async failAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assessmentId = req.params?.assessmentId || req.body?.assessmentId;
      const { reason, errorCode } = req.body;

      if (!assessmentId || !reason) {
        res.status(400).json({ error: 'assessmentId and reason are required' });
        return;
      }

      const result = await this.failAssessmentUseCase.execute({ assessmentId, reason, errorCode });

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
