/**
 * Assessment DTOs (Data Transfer Objects)
 *
 * DTOs are used to transfer data across layer boundaries.
 * They decouple the API contract from internal domain representation.
 *
 * Rules:
 * - Request DTOs: Input validation happens here
 * - Response DTOs: Output serialization
 * - Plain objects, no methods, no validation logic
 */

// ========== Input DTOs ==========

export interface CreateAssessmentRequest {
  customerId: string;
  monthlyIncome: number;
  totalExpenses: number;
  billAmount: number;
  arrears: number;
  vulnerabilities: Record<string, boolean>;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
}

export interface GetAssessmentRequest {
  assessmentId: string;
}

export interface ListAssessmentsRequest {
  customerId: string;
  limit?: number;
  offset?: number;
}

// ========== Output DTOs ==========

export interface HardshipDto {
  level: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  confidenceScore: number;
  disposableIncome: number;
  billPercentage: number;
}

export interface AssessmentResponse {
  id: string;
  customerId: string;
  monthlyIncome: number;
  totalExpenses: number;
  disposableIncome: number;
  billAmount: number;
  billPercentage: number;
  arrears: number;
  hardship: HardshipDto;
  vulnerabilities: Record<string, boolean>;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  requiresManualReview: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface AssessmentBreakdownResponse {
  assessment: AssessmentResponse;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  eligibleForSupport: boolean;
  recommendedPlanTier: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  recommendedDurationMonths: number;
}

export interface CreateAssessmentResponse {
  assessmentId: string;
  hardshipLevel: string;
  requiresManualReview: boolean;
  createdAt: string;
}

export interface ListAssessmentsResponse {
  assessments: AssessmentResponse[];
  total: number;
  limit: number;
  offset: number;
}
