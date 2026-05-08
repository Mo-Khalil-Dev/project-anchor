import { AggregateRoot } from '@/core/domain/common/AggregateRoot';
import type { AssessmentProps } from './assessment-props';
import {
  ASSESSMENT_STATUS,
  type AssessmentStatus,
} from '@/features/assessment/domain/entities/assessment-status';
import {
  HARDSHIP_LEVEL,
  type HardshipLevel,
} from '@/features/assessment/domain/entities/hardship-level';
import {
  SUSTAINABILITY_SCORE,
  type SustainabilityScore,
} from '@/features/assessment/domain/entities/sustainability-score';
import {
  AssessmentCreatedEvent,
  AssessmentCompletedEvent,
  AssessmentFailedEvent,
  PaymentPlanSelectedEvent,
  AssessmentReadyForProcessingEvent,
} from '../events';
import { InvalidBillingInfoError } from '@/features/auth/domain/errors/InvalidBillingInfoError';
import { PlanType } from '@/features/assessment/domain/entities/plan-type';
import { PlanSpecification } from '@/features/assessment/domain/entities/plan-specification.value-object';

export class Assessment extends AggregateRoot<string> {
  private readonly customerId: string;
  private readonly bankConnectionId: string | null;
  private monthlyIncome: number;
  private monthlyExpenses: number;
  private monthlyBill: number;
  private arrears: number | null;
  private incomeBreakdown: string | null;
  private expenseBreakdown: string | null;
  private expensesByCategory: string | null;
  private incomeHistory: string | null;
  private incomeSources: string | null;
  private factors: string | null;
  private paymentPlans: PlanSpecification[] | null;
  private selectedPlan: PlanType | null;
  private updatedAt: Date;
  private status: AssessmentStatus;

  private constructor(props: AssessmentProps) {
    super(props.id, props.createdAt);
    this.customerId = props.customerId;
    this.bankConnectionId = props.bankConnectionId ?? null;
    this.monthlyIncome = props.monthlyIncome;
    this.monthlyExpenses = props.monthlyExpenses;
    this.monthlyBill = props.monthlyBill;
    this.arrears = props.arrears ?? null;
    this.incomeBreakdown = props.incomeBreakdown ?? null;
    this.expenseBreakdown = props.expenseBreakdown ?? null;
    this.expensesByCategory = props.expensesByCategory ?? null;
    this.incomeHistory = props.incomeHistory ?? null;
    this.incomeSources = props.incomeSources ?? null;
    this.factors = props.factors ?? null;
    this.paymentPlans = props.paymentPlans ?? null;
    this.selectedPlan = props.selectedPlan;
    this.status = props.status;
    this.updatedAt = props.updatedAt;
  }

  static create(customerId: string, bankConnectionId?: string): Assessment {
    const now = new Date();
    const assessment = new Assessment({
      id: crypto.randomUUID(),
      customerId,
      bankConnectionId: bankConnectionId ?? null,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyBill: 0,
      arrears: null,
      incomeBreakdown: null,
      expenseBreakdown: null,
      expensesByCategory: null,
      incomeHistory: null,
      incomeSources: null,
      factors: null,
      paymentPlans: null,
      selectedPlan: null,
      status: ASSESSMENT_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
    });
    assessment.addDomainEvent(
      new AssessmentCreatedEvent(assessment.id, assessment.getVersion(), {
        customerId,
        bankConnectionId: bankConnectionId ?? null,
      })
    );
    return assessment;
  }

  static reconstruct(props: AssessmentProps): Assessment {
    return new Assessment(props);
  }

  getId(): string {
    return this.id;
  }

  getCustomerId(): string {
    return this.customerId;
  }

  getBankConnectionId(): string | null {
    return this.bankConnectionId;
  }

  getMonthlyIncome(): number {
    return this.monthlyIncome;
  }

  getMonthlyExpenses(): number {
    return this.monthlyExpenses;
  }

  getMonthlyBill(): number {
    return this.monthlyBill;
  }

  getArrears(): number {
    return this.arrears ?? 0;
  }

  getIncomeBreakdown(): string | null {
    return this.incomeBreakdown;
  }

  getExpenseBreakdown(): string | null {
    return this.expenseBreakdown;
  }

  getExpensesByCategory(): string | null {
    return this.expensesByCategory;
  }

  getIncomeHistory(): string | null {
    return this.incomeHistory;
  }

  getIncomeSources(): string | null {
    return this.incomeSources;
  }

  getFactors(): string | null {
    return this.factors;
  }

  getPaymentPlans(): PlanSpecification[] | null {
    return this.paymentPlans;
  }

  getSelectedPlan(): PlanType | null {
    return this.selectedPlan;
  }

  getStatus(): AssessmentStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  calculateDisposableIncome(): number {
    const disposable = this.monthlyIncome - this.monthlyExpenses;
    return Math.round(disposable * 100) / 100;
  }

  calculateBillRatio(): number {
    const disposable = this.calculateDisposableIncome();

    if (disposable <= 0) {
      return Number.POSITIVE_INFINITY;
    }

    const ratio = (this.monthlyBill / disposable) * 100;
    return Math.round(ratio * 100) / 100;
  }

  getHardshipLevel(): HardshipLevel {
    const disposable = this.calculateDisposableIncome();
    const ratio = this.calculateBillRatio();

    if (ratio > 100 || disposable <= 0) {
      return HARDSHIP_LEVEL.SEVERE;
    }

    if (ratio > 25) {
      return HARDSHIP_LEVEL.SEVERE;
    }

    if (ratio > 10) {
      return HARDSHIP_LEVEL.MODERATE;
    }

    if (ratio >= 0) {
      return ratio > 5 ? HARDSHIP_LEVEL.LOW : HARDSHIP_LEVEL.NONE;
    }

    return HARDSHIP_LEVEL.NONE;
  }

  getSustainabilityScore(): SustainabilityScore {
    const disposable = this.calculateDisposableIncome();

    if (disposable <= 0) {
      return SUSTAINABILITY_SCORE.LOW;
    }

    const ratio = this.calculateBillRatio();

    if (ratio > 100) {
      return SUSTAINABILITY_SCORE.LOW;
    }

    if (ratio > 25) {
      return SUSTAINABILITY_SCORE.MEDIUM;
    }

    if (ratio > 10) {
      return SUSTAINABILITY_SCORE.HIGH;
    }

    return SUSTAINABILITY_SCORE.HIGH;
  }

  markAsCompleted(): void {
    this.status = ASSESSMENT_STATUS.COMPLETED;
    this.updatedAt = new Date();
    this.incrementVersion();

    this.addDomainEvent(
      new AssessmentCompletedEvent(this.id, this.getVersion(), {
        hardshipLevel: this.getHardshipLevel(),
        disposableIncome: this.calculateDisposableIncome(),
        billRatio: this.calculateBillRatio(),
        paymentPlans: this.paymentPlans ? JSON.stringify(this.paymentPlans.map(p => p.toJSON())) : null,
      })
    );
  }

  markAsFailed(reason: string, errorCode?: string): void {
    this.status = ASSESSMENT_STATUS.FAILED;
    this.updatedAt = new Date();
    this.incrementVersion();

    this.addDomainEvent(
      new AssessmentFailedEvent(this.id, this.getVersion(), {
        reason,
        errorCode,
      })
    );
  }

  selectPaymentPlan(planType: 'Conservative' | 'Balanced' | 'Aggressive'): void {
    this.selectedPlan = planType;
    this.updatedAt = new Date();
    this.incrementVersion();

    this.addDomainEvent(
      new PaymentPlanSelectedEvent(this.id, this.getVersion(), {
        planType,
        selectedAt: new Date(),
      })
    );
  }

  assignBill(monthlyBill: number, arrears: number | null): void {
    if ((monthlyBill !== null && monthlyBill < 0) || (arrears !== null && arrears < 0)) {
      throw new InvalidBillingInfoError({
        monthlyBill: monthlyBill,
        arrears: arrears,
        customerId: this.customerId,
      });
    }
    this.monthlyBill = monthlyBill;
    this.arrears = arrears;
  }

  recordFinancialProfile(
    income: number,
    expenses: number,
    breakdown: {
      incomeBreakdown?: string | null;
      expenseBreakdown?: string | null;
      expensesByCategory?: string | null;
      incomeHistory?: string | null;
      incomeSources?: string | null;
      factors?: string | null;
    }
  ): void {
    this.monthlyIncome = income;
    this.monthlyExpenses = expenses;
    this.incomeBreakdown = breakdown.incomeBreakdown ?? null;
    this.expenseBreakdown = breakdown.expenseBreakdown ?? null;
    this.expensesByCategory = breakdown.expensesByCategory ?? null;
    this.incomeHistory = breakdown.incomeHistory ?? null;
    this.incomeSources = breakdown.incomeSources ?? null;
    this.factors = breakdown.factors ?? null;
    this.updatedAt = new Date();
  }

  recordPaymentPlans(plans: PlanSpecification[] | null): void {
    this.paymentPlans = plans;
    this.updatedAt = new Date();
  }

  markReadyForProcessing(): void {
    this.status = ASSESSMENT_STATUS.PENDING;
    this.updatedAt = new Date();
    this.incrementVersion();

    this.addDomainEvent(
      new AssessmentReadyForProcessingEvent(this.id, this.getVersion(), {
        assessmentId: this.id,
      })
    );
  }
}
