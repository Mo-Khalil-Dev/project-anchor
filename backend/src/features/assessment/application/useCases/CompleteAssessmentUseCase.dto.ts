export interface CompleteAssessmentInput {
  assessmentId: string;
}

export interface CompleteAssessmentOutput {
  assessmentId: string;
  status: 'COMPLETED';
  hardshipLevel: string;
  disposableIncome: number;
}
