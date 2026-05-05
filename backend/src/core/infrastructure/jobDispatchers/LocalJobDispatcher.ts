import type { IJobDispatcher } from '../../application/services/IJobDispatcher';
import type { IBackgroundJob } from '../../application/services/IBackgroundJob';
import type { ILogger } from '../../../features/shared/logging';

export class LocalJobDispatcher implements IJobDispatcher {
  constructor(
    private jobService: IBackgroundJob<string>,
    private logger: ILogger,
    private delayMs: number = 35_000,
  ) {}

  async dispatch(jobId: string): Promise<void> {
    this.logger.info('Background job queued for local processing', {
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
            this.logger.error('Background local job failed', {
              jobId,
              error: result.getError()?.message,
            });
          } else {
            this.logger.info('Background local job completed', {
              jobId,
            });
          }
        } catch (error) {
          this.logger.error('Unexpected error in background local job', {
            jobId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })();
    });
  }
}
