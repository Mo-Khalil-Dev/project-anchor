export type HardshipLevel = 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
export type SustainabilityScore = 'HIGH' | 'MEDIUM' | 'LOW';
export type AssessmentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

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
  status: AssessmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Assessment {
  private readonly id: string;
  private readonly customerId: string;
  private readonly bankConnectionId: string | null;
  private readonly monthlyIncome: number;
  private readonly monthlyExpenses: number;
  private readonly monthlyBill: number;
  private readonly arrears: number | null;
  private readonly incomeBreakdown: string | null;
  private readonly expenseBreakdown: string | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private status: AssessmentStatus;

  constructor(props: AssessmentProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.bankConnectionId = props.bankConnectionId ?? null;
    this.monthlyIncome = props.monthlyIncome;
    this.monthlyExpenses = props.monthlyExpenses;
    this.monthlyBill = props.monthlyBill;
    this.arrears = props.arrears ?? null;
    this.incomeBreakdown = props.incomeBreakdown ?? null;
    this.expenseBreakdown = props.expenseBreakdown ?? null;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<AssessmentProps, 'createdAt' | 'updatedAt'>): Assessment {
    const now = new Date();
    return new Assessment({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
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
      return 'SEVERE';
    }

    if (ratio > 25) {
      return 'SEVERE';
    }

    if (ratio > 10) {
      return 'MODERATE';
    }

    if (ratio >= 0) {
      return ratio > 5 ? 'LOW' : 'NONE';
    }

    return 'NONE';
  }

  getSustainabilityScore(): SustainabilityScore {
    const disposable = this.calculateDisposableIncome();

    if (disposable <= 0) {
      return 'LOW';
    }

    const ratio = this.calculateBillRatio();

    if (ratio > 100) {
      return 'LOW';
    }

    if (ratio > 25) {
      return 'MEDIUM';
    }

    if (ratio > 10) {
      return 'HIGH';
    }

    return 'HIGH';
  }

  markAsCompleted(): void {
    this.status = 'COMPLETED';
    this.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.status = 'FAILED';
    this.updatedAt = new Date();
  }
}
