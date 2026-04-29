import type { IJobDispatcher } from './IJobDispatcher';
import type { ProcessAssessmentJobService } from '../services/ProcessAssessmentJobService';
import type { ILogger } from '../../shared/logging';

/**
 * LocalJobDispatcher
 *
 * Dispatches assessment jobs as a non-blocking background task for local development.
 * The HTTP response is returned to the client immediately; the job runs after a
 * configurable delay so the frontend pending/holding UI state is visible and testable.
 *
 * Default delay: 35 seconds. Override via JOB_DISPATCH_DELAY_MS env var.
 * Set JOB_DISPATCH_DELAY_MS=0 to skip the delay when you don't need to test the UI.
 *
 * In AWS, replace with SqsJobDispatcher.
 */
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

    setImmediate(async () => {
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
    });
  }
}
