import type { Response } from 'express';
import type { GetReferenceDataUseCase } from '../../application/useCases/GetReferenceDataUseCase';
import { AuthenticatedRequest } from '@/features/shared/types/auth';

export class ReferenceDataController {
  constructor(
    private getReferenceDataUseCase: GetReferenceDataUseCase
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
}
