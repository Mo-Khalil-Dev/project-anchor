import type { IEventHandler } from '../../../../core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '../../domain/events/AssessmentReadyForProcessingEvent';
import type { ILogger } from '../../../shared/logging';
import type { IBackgroundJob } from '../../../../core/application/services/IBackgroundJob';

export class AssessmentReadyLocalDatabaseHandler implements IEventHandler<AssessmentReadyForProcessingEvent> {
  constructor(
    private backgroundJob: IBackgroundJob<string>,
    private logger: ILogger,
    private delayMs: number = 0,
  ) { }

  async handle(event: AssessmentReadyForProcessingEvent): Promise<void> {
    const assessmentId = event.assessmentId;

    this.logger.info('Assessment ready for processing', {
      assessmentId,
      delayMs: this.delayMs,
    });

    if (this.delayMs > 0) {
      setTimeout(async () => {
        await this.processAssessment(assessmentId);
      }, this.delayMs);
    } else {
      await this.processAssessment(assessmentId);
    }
  }

  private async processAssessment(assessmentId: string): Promise<void> {
    try {
      this.logger.info('Processing assessment', { assessmentId });
      await this.backgroundJob.execute(assessmentId);
      this.logger.info('Assessment processed successfully', { assessmentId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to process assessment', {
        assessmentId,
        error: message,
      });
    }
  }
}
