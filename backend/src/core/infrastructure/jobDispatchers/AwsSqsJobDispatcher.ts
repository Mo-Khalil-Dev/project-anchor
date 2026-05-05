import * as AWS from 'aws-sdk';
import type { IJobDispatcher } from '../../application/services/IJobDispatcher';
import type { ILogger } from '../../../features/shared/logging';

export class AwsSqsJobDispatcher implements IJobDispatcher {
  private readonly sqs: AWS.SQS;

  constructor(
    private readonly queueUrl: string,
    private readonly logger: ILogger,
    sqs?: AWS.SQS,
  ) {
    this.sqs = sqs ?? new AWS.SQS();
  }

  async dispatch(jobId: string): Promise<void> {
    await this.sqs
      .sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({ jobId }),
      })
      .promise();

    this.logger.info('Background job sent to SQS', {
      queueUrl: this.queueUrl,
      jobId,
    });
  }
}
