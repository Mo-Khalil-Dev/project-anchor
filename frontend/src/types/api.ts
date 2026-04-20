/**
 * API Types
 * Type definitions for all API endpoints and responses
 */

import {
  AssessmentData,
  PaymentPlan,
  Case,
  ApiResponse,
  PaginatedResponse,
} from './index';

// ── Bank Connection ────────────────────────────────────────────
export interface TinkAuthResponse {
  authorizationId: string;
  redirectUrl: string;
  expiresAt: string;
}

export interface BankConnectionData {
  bankName: string;
  accountNumber: string;
  sortCode: string;
  lastFour: string;
  connectionVerifiedAt: string;
}

// ── Assessment API ────────────────────────────────────────────
export interface AssessmentRequest {
  customerId: string;
  bankConnectionId?: string;
  statementUploadIds?: string[];
}

export interface AssessmentResponse extends ApiResponse<AssessmentData> {
  customerId: string;
  hardshipLevel: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
  confidence: number;
  generatedAt: string;
}

// ── Payment Plans API ──────────────────────────────────────────
export interface PaymentPlansResponse extends ApiResponse<PaymentPlan[]> {
  customerId: string;
  generatedAt: string;
}

// ── Cases API ──────────────────────────────────────────────────
export interface GetCaseResponse extends ApiResponse<Case> {}

export interface ListCasesRequest {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export interface ListCasesResponse
  extends ApiResponse<PaginatedResponse<Case>> {}

export interface UpdateCaseRequest {
  status?: string;
  priority?: string;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateCaseResponse extends ApiResponse<Case> {}

// ── Officer Actions ───────────────────────────────────────────
export interface ModifyPlanRequest {
  caseId: string;
  monthlyAmount: number;
  durationMonths: number;
  supportMeasures: string[];
  justification: string;
}

export interface RequestInfoRequest {
  caseId: string;
  questions: string[];
  deadlineInDays: number;
}

export interface EscalateRequest {
  caseId: string;
  assignedTo: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  justification: string;
}

// ── Health Check ───────────────────────────────────────────────
export interface HealthCheckResponse extends ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
}> {}
