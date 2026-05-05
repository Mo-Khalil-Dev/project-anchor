export interface FailAssessmentInput {
  assessmentId: string;
  reason: string;
  errorCode?: string;
}

export interface FailAssessmentOutput {
  assessmentId: string;
  status: 'FAILED';
  reason: string;
  errorCode?: string;
}
