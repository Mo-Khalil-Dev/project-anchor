export const ASSESSMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const assessmentStatusValues = Object.values(ASSESSMENT_STATUS);

export type AssessmentStatus = (typeof ASSESSMENT_STATUS)[keyof typeof ASSESSMENT_STATUS];

export function isAssessmentStatus(value: string): value is AssessmentStatus {
  return assessmentStatusValues.includes(value as AssessmentStatus);
}
