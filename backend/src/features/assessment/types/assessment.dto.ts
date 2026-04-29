/**
 * AssessmentDetailedDTO
 *
 * Data Transfer Object for the Reference Data endpoint response.
 * Strongly typed breakdown data for the Assessment Breakdown UI (4 tabs).
 *
 * Used by: GET /api/me/assessment
 */

export interface ExpenseRecord {
  category: string;
  amount: number;
  ukAverage?: number;
}

export interface IncomeRecord {
  month: string;
  amount: number;
}

export interface IncomeSource {
  type: string; // 'Employment', 'Benefits', 'Pension', etc.
  amount: number;
  frequency: string; // 'Monthly', 'Weekly', etc.
}

export interface AssessmentFactor {
  title: string;
  description: string;
}

export interface PaymentPlanDTO {
  type: 'Conservative' | 'Balanced' | 'Aggressive';
  monthlyAmount: number;
  duration: number; // months
  totalRepayment: number;
  sustainability: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AssessmentDetailedDTO {
  id: string;
  customerId: string;
  hardshipLevel: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
  disposableIncome: number;
  billRatio: number; // percentage
  monthlyBill: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  arrears: number;

  // Breakdown data (5 JSON columns)
  expensesByCategory: Record<string, number>;
  incomeHistory: IncomeRecord[];
  incomeSources: IncomeSource[];
  factors: AssessmentFactor[];
  paymentPlans: PaymentPlanDTO[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}
