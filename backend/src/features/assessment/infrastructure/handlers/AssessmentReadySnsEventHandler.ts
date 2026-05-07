import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import type { IEventHandler } from '@/core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/assessment/domain/events/AssessmentReadyForProcessingEvent';
import type { ILogger } from '../../../shared/logging';

export class AssessmentReadySnsEventHandler implements IEventHandler<AssessmentReadyForProcessingEvent> {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor(
    private logger: ILogger,
    awsRegion: string = 'us-east-1',
    topicArn?: string
  ) {
    this.snsClient = new SNSClient({ region: awsRegion });
    this.topicArn = topicArn || process.env.AWS_ASSESSMENT_TOPIC_ARN || '';

    if (!this.topicArn) {
      throw new Error('AWS_ASSESSMENT_TOPIC_ARN must be configured for SNS handler');
    }
  }

  async handle(event: AssessmentReadyForProcessingEvent): Promise<void> {
    try {
      this.logger.info('Publishing assessment event to SNS', {
        assessmentId: event.assessmentId,
        topicArn: this.topicArn,
      });

      const message = {
        eventName: event.getEventName(),
        assessmentId: event.assessmentId,
        aggregateId: event.aggregateId,
        aggregateVersion: event.aggregateVersion,
        occurredAt: event.occurredAt.toISOString(),
        payload: event.payload,
      };

      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        Subject: 'AssessmentReadyForProcessing',
        MessageAttributes: {
          eventName: {
            DataType: 'String',
            StringValue: 'AssessmentReadyForProcessing',
          },
          assessmentId: {
            DataType: 'String',
            StringValue: event.assessmentId,
          },
        },
      });

      await this.snsClient.send(command);

      this.logger.info('Assessment event published to SNS successfully', {
        assessmentId: event.assessmentId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to publish assessment event to SNS', {
        assessmentId: event.assessmentId,
        error: message,
      });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.snsClient.destroy();
  }
}
