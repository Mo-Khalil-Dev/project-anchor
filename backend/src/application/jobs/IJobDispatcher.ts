/**
 * IJobDispatcher
 *
 * Abstraction over how an assessment job is dispatched after the bank OAuth
 * callback completes.
 *
 * Local development: LocalJobDispatcher — runs in-process via setImmediate with a delay
 * AWS production:    SqsJobDispatcher  — sends a message to an SQS queue
 */
export interface IJobDispatcher {
  dispatch(jobId: string): Promise<void>;
}
