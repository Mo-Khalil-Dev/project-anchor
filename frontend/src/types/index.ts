/**
 * Bridge Application Types
 * Central type definitions for the entire application
 */

// ── Customer Domain ────────────────────────────────────────────
export type HardshipLevel = 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
export type PaymentPlanType = 'conservative' | 'balanced' | 'aggressive';
export type SustainabilityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type CustomerJourneyStep =
  | 'home'
  | 'bank-connection'
  | 'assessment'
  | 'plan-select'
  | 'plan-detail'
  | 'setup'
  | 'confirmation'
  | 'payment-portal';

export type BankJourneyState =
  | 'intro'
  | 'privacy'
  | 'youAreBeingDirected'
  | 'connecting'
  | 'success'
  | 'error';

export interface AssessmentData {
  monthlyIncome: number;
  totalExpenses: number;
  disposable: number;
  billBalance: number;
  billRatioPct: number;
  dataQuality: number;
}

export interface IncomeBreakdown {
  salary: number;
  pension: number;
  benefits: number;
  cashDeposits: number;
  other: number;
  total: number;
}

export interface ExpenseBreakdown {
  housing: number;
  food: number;
  utilities: number;
  transport: number;
  other: number;
  total: number;
}

export interface BankConnectionData {
  bankName?: string;
  transactions?: string;
  monthlyIncome?: number;
  avgMonthlySpend?: number;
  expenseCheckReportId?: string;
  connectionId?: string;
  authUrl?: string;
  state?: string;
  totalIncome?: number;
  totalExpenses?: number;
  assessmentId?: string;
  incomeBreakdown?: IncomeBreakdown;
  expenseBreakdown?: ExpenseBreakdown;
}

export interface BankError {
  code?: string;
  message?: string;
  timestamp?: string;
}

export interface PaymentPlan {
  id: PaymentPlanType;
  monthlyAmount: number;
  durationMonths: number;
  buffer: number;
  sustainability: SustainabilityLevel;
  recommended: boolean;
}

export interface Customer {
  id: string;
  name: string;
  accountRef: string;
  hardshipLevel: HardshipLevel;
  assessment?: AssessmentData;
  selectedPlan?: PaymentPlanType;
  createdAt: string;
  updatedAt: string;
}

// ── Admin Domain ──────────────────────────────────────────────
export type CaseReviewTab = 'overview' | 'customer' | 'financial' | 'bank';
export type CaseStatus = 'pending' | 'in-review' | 'approved' | 'modified' | 'escalated';
export type CasePriority = 'high' | 'medium' | 'low';

export interface Case {
  id: string;
  customerId: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes?: string;
}

export interface OfficerAction {
  type: 'modify' | 'request-info' | 'escalate' | 'approve';
  caseId: string;
  notes: string;
  timestamp: string;
}

// ── Policy Domain ─────────────────────────────────────────────
export interface PolicyConfig {
  severePct: number; // 200%
  moderateLow: number; // 100%
  moderateHigh: number; // 200%
  lowPct: number; // 100%
  maxDuration: number; // 24 months
  minPayment: number; // £10
  maxPaymentPct: number; // 50% of disposable
  medicalNoDisconnect: boolean;
  mentalHealthReview: boolean;
  flagBillRatio: number; // 200%
  flagDataQuality: number; // 75
  flagConfidence: number; // 80
}

// ── API Response Types ────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ── Form Types ────────────────────────────────────────────────
export interface DirectDebitFormData {
  accountHolder: string;
  sortCode: string;
  accountNumber: string;
  paymentDate: number;
}

export interface PaymentMethodFormData {
  method: 'direct-debit' | 'card' | 'post-office';
  directDebit?: DirectDebitFormData;
}

export interface AssessmentFormData {
  monthlyIncome: number;
  totalExpenses: number;
}

// ── Component Props Types ─────────────────────────────────────
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'between' | 'end';
  className?: string;
}

export interface HardshipBadgeProps {
  level: HardshipLevel;
  className?: string;
}

export interface SustBadgeProps {
  level: SustainabilityLevel;
  className?: string;
}

export interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
  borderColor?: 'accent' | 'green' | 'amber' | 'red' | 'blue';
  className?: string;
}

export interface CustomerLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

// ── Redux State Types ──────────────────────────────────────────
export interface CustomerSliceState {
  currentStep: CustomerJourneyStep;
  bankConnected: boolean;
  selectedPlan?: PaymentPlanType;
  assessment?: AssessmentData;
  hardshipLevel?: HardshipLevel;
  bankJourneyState?: BankJourneyState;
  bankConnectionData?: BankConnectionData;
  bankError?: BankError;
}

export interface AdminSliceState {
  selectedCaseId?: string;
  caseReviewTab: CaseReviewTab;
  modifyPlanMode: boolean;
  requestInfoMode: boolean;
  escalateMode: boolean;
}

export interface RootState {
  customer: CustomerSliceState;
  admin: AdminSliceState;
}

// ── Utility Types ──────────────────────────────────────────────
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncState<T> = {
  data: Optional<T>;
  loading: boolean;
  error: Optional<ApiErrorResponse>;
};
