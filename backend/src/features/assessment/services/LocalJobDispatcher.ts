import type { IJobDispatcher } from './IJobDispatcher';
import type { ProcessAssessmentJobService } from './ProcessAssessmentJobService';
import type { ILogger } from '../../shared/logging';

export class LocalJobDispatcher implements IJobDispatcher {
  constructor(
    private jobService: ProcessAssessmentJobService,
    private logger: ILogger,
    private delayMs: number = 35_000,
  ) {}

  async dispatch(jobId: string): Promise<void> {
    this.logger.info('Assessment job queued for background processing', {
      jobId,
      delayMs: this.delayMs,
    });

    setImmediate(() => {
      (async () => {
        try {
          if (this.delayMs > 0) {
            await new Promise<void>(resolve => setTimeout(resolve, this.delayMs));
          }

          const result = await this.jobService.execute(jobId);

          if (result.isFail) {
            this.logger.error('Background assessment job failed', {
              jobId,
              error: result.getError()?.message,
            });
          } else {
            this.logger.info('Background assessment job completed', { jobId });
          }
        } catch (error) {
          this.logger.error('Unexpected error in background assessment job', {
            jobId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })();
    });
  }
}
