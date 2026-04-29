export interface IJobDispatcher {
  dispatch(jobId: string): Promise<void>;
}
