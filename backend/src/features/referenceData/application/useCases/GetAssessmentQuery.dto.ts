export type AssessmentStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type HardshipLevel = 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
export type SustainabilityScore = 'HIGH' | 'MEDIUM' | 'LOW';

export interface IncomeRecord {
  month: string;
  amount: number;
}

export interface IncomeSource {
  type: string;
  amount: number;
  frequency: string;
}

export interface AssessmentFactor {
  title: string;
  description: string;
}

export interface PaymentPlan {
  type: 'Conservative' | 'Balanced' | 'Aggressive';
  monthlyAmount: number;
  duration: number; // months
  totalRepayment: number;
  sustainability: SustainabilityScore;
}

export interface AssessmentData {
  id: string;
  status: AssessmentStatusType;
  hardshipLevel: HardshipLevel;
  disposableIncome: number;
  monthlyBill: number;
  billRatio: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  expensesByCategory: Record<string, number>;
  incomeSources: IncomeSource[];
  incomeHistory: IncomeRecord[];
  factors: AssessmentFactor[];
  paymentPlans: PaymentPlan[];
  createdAt: string;
}
