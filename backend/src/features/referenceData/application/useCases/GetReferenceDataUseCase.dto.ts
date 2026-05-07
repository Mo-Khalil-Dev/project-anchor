import type { AssessmentData } from './GetAssessmentQuery.dto';

export type NextStep =
  | 'ACCOUNT_SETUP'
  | 'ACCOUNT_SETUP_LOADING'
  | 'BANK_CONNECTION'
  | 'ASSESSMENT_CALCULATING'
  | 'ASSESSMENT'
  | 'PAYMENT_PLANS'
  | 'DIRECT_DEBIT_SETUP'
  | 'DIRECT_DEBIT_PENDING'
  | 'COMPLETE';

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

export interface MandateData {
  id: string;
  status: 'PENDING' | 'CREATED' | 'ACTIVE' | 'FAILED' | 'CANCELLED';
  gocardlessId: string | null;
  createdAt: string;
}

export interface ReferenceData {
  accountSetup: AccountSetupData | null;
  bankConnection: BankConnectionData | null;
  assessment: AssessmentData | null;
  mandate: MandateData | null;
  paymentPlans: any[];
  nextStep: NextStep;
}
