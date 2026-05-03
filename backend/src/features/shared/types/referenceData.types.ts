import type { Result } from '../result';

export type NextStep = 'ACCOUNT_SETUP' | 'ACCOUNT_SETUP_LOADING' | 'BANK_CONNECTION' | 'ASSESSMENT_CALCULATING' | 'ASSESSMENT' | 'PAYMENT_PLANS' | 'COMPLETE';
export type HardshipLevel = 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
export type AssessmentStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type SustainabilityScore = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AccountSetupData {
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  customerId: string;
  utility: 'ELECTRICITY' | 'GAS' | 'WATER';
  postcode: string;
  lastCompletedAt: string | null;
}

export interface BankConnectionData {
  status: 'CONNECTED' | 'IN_PROGRESS' | 'NOT_STARTED';
  bankName: string | null;
  accountNumber: string | null; // Last 4 digits only
  connectedAt: string | null;
}

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
  expensesByCategory: Record<string, number>;
  incomeSources: IncomeSource[];
  incomeHistory: IncomeRecord[];
  factors: AssessmentFactor[];
  paymentPlans: PaymentPlan[];
  createdAt: string;
}

export interface ReferenceData {
  accountSetup: AccountSetupData | null;
  bankConnection: BankConnectionData | null;
  assessment: AssessmentData | null;
  paymentPlans: PaymentPlan[];
  nextStep: NextStep;
}

export interface IGetReferenceDataUseCase {
  execute(input: { userId: string }): Promise<Result<ReferenceData, Error>>;
}
