import { AssessmentStatus } from '@/features/referenceData/domain/entities/assessment-status';


export interface AssessmentProps {
  id: string;
  customerId: string;
  bankConnectionId?: string | null;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBill: number;
  arrears?: number | null;
  incomeBreakdown?: string | null;
  expenseBreakdown?: string | null;
  expensesByCategory?: string | null;
  incomeHistory?: string | null;
  incomeSources?: string | null;
  factors?: string | null;
  paymentPlans?: string | null;
  selectedPlan?: string | null;
  status: AssessmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
