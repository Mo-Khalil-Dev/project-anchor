export enum HardshipLevel {
  SEVERE = 'SEVERE',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  NONE = 'NONE',
}

export enum IncomeSourceType {
  SALARY = 'SALARY',
  BENEFITS = 'BENEFITS',
  SELF_EMPLOYMENT = 'SELF_EMPLOYMENT',
  OTHER = 'OTHER',
}

export interface IncomeSource {
  type: IncomeSourceType;
  amount: number;
  frequency: 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
}

export interface IncomeRecord {
  month: string;
  amount: number;
}

export interface AssessmentFactor {
  name: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
}

export type AssessmentStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

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
  accountNumber: string | null;
  connectedAt: string | null;
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
  createdAt: string;
}

export interface PaymentPlan {
  type: 'Conservative' | 'Balanced' | 'Aggressive';
  monthlyAmount: number;
  duration: number;
  totalRepayment: number;
  sustainability: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MandateData {
  id: string;
  status: 'PENDING' | 'CREATED' | 'ACTIVE' | 'FAILED' | 'CANCELLED';
  gocardlessId: string | null;
  createdAt: string;
}

export type NextStep =
  | 'ACCOUNT_SETUP'
  | 'ACCOUNT_SETUP_LOADING'
  | 'BANK_CONNECTION'
  | 'ASSESSMENT'
  | 'ASSESSMENT_CALCULATING'
  | 'PAYMENT_PLANS'
  | 'DIRECT_DEBIT_SETUP'
  | 'DIRECT_DEBIT_PENDING'
  | 'COMPLETE';

export interface ReferenceData {
  accountSetup: AccountSetupData | null;
  bankConnection: BankConnectionData | null;
  assessment: AssessmentData | null;
  paymentPlans: PaymentPlan[];
  mandate: MandateData | null;
  nextStep: NextStep;
}
