import { AssessmentStatus } from '@/features/assessment/domain/entities/assessment-status';
import { PlanType } from '@/features/assessment/domain/entities/plan-type';
import { PlanSpecification } from '@/features/assessment/domain/entities/plan-specification.value-object';

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
  paymentPlans?: PlanSpecification[] | null;
  selectedPlan: PlanType | null;
  status: AssessmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
