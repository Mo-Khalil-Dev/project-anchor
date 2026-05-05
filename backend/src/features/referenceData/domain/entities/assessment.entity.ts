import { AggregateRoot } from '@/features/shared/domain/AggregateRoot';
import type { AssessmentProps } from './assessment-props';
import {
  ASSESSMENT_STATUS,
  type AssessmentStatus,
} from '@/features/referenceData/domain/entities/assessment-status';
import {
  HARDSHIP_LEVEL,
  type HardshipLevel,
} from '@/features/referenceData/domain/entities/hardship-level';
import {
  SUSTAINABILITY_SCORE,
  type SustainabilityScore,
} from '@/features/referenceData/domain/entities/sustainability-score';
import { AssessmentCreatedEvent, AssessmentCompletedEvent, AssessmentFailedEvent, PaymentPlanSelectedEvent } from '../events';

export class Assessment extends AggregateRoot<string> {
  private readonly customerId: string;
  private readonly bankConnectionId: string | null;
  private readonly monthlyIncome: number;
  private readonly monthlyExpenses: number;
  private readonly monthlyBill: number;
  private readonly arrears: number | null;
  private readonly incomeBreakdown: string | null;
  private readonly expenseBreakdown: string | null;
  private readonly expensesByCategory: string | null;
  private readonly incomeHistory: string | null;
  private readonly incomeSources: string | null;
  private readonly factors: string | null;
  private readonly paymentPlans: string | null;
  private selectedPlan: string | null;
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
    this.selectedPlan = props.selectedPlan ?? null;
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

  getArrears(): number | null {
    return this.arrears;
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

  getPaymentPlans(): string | null {
    return this.paymentPlans;
  }

  getSelectedPlan(): string | null {
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
        paymentPlans: this.paymentPlans,
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
}
