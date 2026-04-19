import { Hardship } from '../value-objects/Hardship.vo';
import { DomainError } from '../errors/DomainError';

export interface AssessmentProps {
  id: string;
  customerId: string;
  monthlyIncome: number;
  totalExpenses: number;
  billAmount: number;
  arrears: number;
  vulnerabilities: Record<string, boolean>;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  hardship: Hardship;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Assessment Aggregate Root
 *
 * Represents a financial hardship assessment for a customer.
 * Encapsulates validation, calculation, and state transitions.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only manages assessment domain logic
 * - Open/Closed: Extensible through composition (Hardship VO)
 * - Liskov Substitution: Implements contract methods reliably
 * - Interface Segregation: Public methods are cohesive
 * - Dependency Inversion: Depends on Hardship (abstraction), not concrete classes
 */
export class Assessment {
  private readonly id: string;
  private readonly customerId: string;
  private readonly monthlyIncome: number;
  private readonly totalExpenses: number;
  private readonly billAmount: number;
  private readonly arrears: number;
  private readonly vulnerabilities: Record<string, boolean>;
  private readonly incomeBreakdown: Record<string, number>;
  private readonly expenseBreakdown: Record<string, number>;
  private readonly hardship: Hardship;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  private constructor(props: AssessmentProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.monthlyIncome = props.monthlyIncome;
    this.totalExpenses = props.totalExpenses;
    this.billAmount = props.billAmount;
    this.arrears = props.arrears;
    this.vulnerabilities = props.vulnerabilities;
    this.incomeBreakdown = props.incomeBreakdown;
    this.expenseBreakdown = props.expenseBreakdown;
    this.hardship = props.hardship;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new Assessment.
   * Validates all inputs before creating instance.
   */
  static create(props: Omit<AssessmentProps, 'id' | 'createdAt' | 'updatedAt' | 'hardship'>): Assessment {
    // Validate required fields
    if (!props.customerId || props.customerId.trim() === '') {
      throw new DomainError('INVALID_CUSTOMER_ID', 'Customer ID is required');
    }

    // Validate income and expenses are non-negative
    if (props.monthlyIncome < 0) {
      throw new DomainError('INVALID_INCOME', 'Monthly income cannot be negative');
    }

    if (props.totalExpenses < 0) {
      throw new DomainError('INVALID_EXPENSES', 'Total expenses cannot be negative');
    }

    if (props.billAmount < 0) {
      throw new DomainError('INVALID_BILL_AMOUNT', 'Bill amount cannot be negative');
    }

    if (props.arrears < 0) {
      throw new DomainError('INVALID_ARREARS', 'Arrears cannot be negative');
    }

    // Validate breakdowns sum to totals
    const incomeSum = Object.values(props.incomeBreakdown).reduce((sum, val) => sum + val, 0);
    const expenseSum = Object.values(props.expenseBreakdown).reduce((sum, val) => sum + val, 0);

    if (Math.abs(incomeSum - props.monthlyIncome) > 0.01) {
      throw new DomainError(
        'INCOME_BREAKDOWN_MISMATCH',
        `Income breakdown (${incomeSum}) does not match total (${props.monthlyIncome})`
      );
    }

    if (Math.abs(expenseSum - props.totalExpenses) > 0.01) {
      throw new DomainError(
        'EXPENSE_BREAKDOWN_MISMATCH',
        `Expense breakdown (${expenseSum}) does not match total (${props.totalExpenses})`
      );
    }

    // Calculate hardship level
    const hardship = Hardship.calculate({
      monthlyIncome: props.monthlyIncome,
      totalExpenses: props.totalExpenses,
      billAmount: props.billAmount,
      arrears: props.arrears,
      vulnerabilities: props.vulnerabilities,
    });

    const now = new Date();
    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Assessment({
      id: assessmentId,
      customerId: props.customerId,
      monthlyIncome: props.monthlyIncome,
      totalExpenses: props.totalExpenses,
      billAmount: props.billAmount,
      arrears: props.arrears,
      vulnerabilities: props.vulnerabilities,
      incomeBreakdown: props.incomeBreakdown,
      expenseBreakdown: props.expenseBreakdown,
      hardship,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstruct Assessment from persistence (used by repository).
   * Skips validation as data comes from trusted source.
   */
  static fromPersistence(props: AssessmentProps): Assessment {
    return new Assessment(props);
  }

  // ========== Getters ==========

  getId(): string {
    return this.id;
  }

  getCustomerId(): string {
    return this.customerId;
  }

  getMonthlyIncome(): number {
    return this.monthlyIncome;
  }

  getTotalExpenses(): number {
    return this.totalExpenses;
  }

  getBillAmount(): number {
    return this.billAmount;
  }

  getArrears(): number {
    return this.arrears;
  }

  getVulnerabilities(): Record<string, boolean> {
    return { ...this.vulnerabilities };
  }

  getIncomeBreakdown(): Record<string, number> {
    return { ...this.incomeBreakdown };
  }

  getExpenseBreakdown(): Record<string, number> {
    return { ...this.expenseBreakdown };
  }

  getHardship(): Hardship {
    return this.hardship;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ========== Domain Logic ==========

  /**
   * Calculate disposable income (income - expenses).
   * Negative value indicates deficit.
   */
  calculateDisposableIncome(): number {
    return this.monthlyIncome - this.totalExpenses;
  }

  /**
   * Calculate bill as percentage of income.
   * Used for fairness assessment.
   */
  calculateBillPercentageOfIncome(): number {
    if (this.monthlyIncome === 0) return 0;
    return (this.billAmount / this.monthlyIncome) * 100;
  }

  /**
   * Check if assessment indicates customer is vulnerable.
   * Vulnerable if any vulnerability flag is true.
   */
  isVulnerable(): boolean {
    return Object.values(this.vulnerabilities).some((flag) => flag);
  }

  /**
   * Check if assessment has data quality issues.
   * Returns true if multiple income/expense categories are missing (all zeros).
   */
  hasDataQualityIssues(): number {
    const incomeCategories = Object.values(this.incomeBreakdown).filter((val) => val > 0).length;
    const expenseCategories = Object.values(this.expenseBreakdown).filter((val) => val > 0).length;

    // Data quality score: 0-1, where 1 is perfect
    const incomeQuality = Math.min(incomeCategories / 3, 1);
    const expenseQuality = Math.min(expenseCategories / 5, 1);

    return (incomeQuality + expenseQuality) / 2;
  }

  /**
   * Check if customer is flagged for manual review.
   * True if hardship is high or arrears are significant.
   */
  requiresManualReview(): boolean {
    const highHardship = this.hardship.getLevel() === 'SEVERE' || this.hardship.getLevel() === 'MODERATE';
    const significantArrears = this.arrears > this.monthlyIncome * 3;

    return highHardship || significantArrears;
  }

  // ========== Equality and Hashing ==========

  equals(other: Assessment): boolean {
    return this.id === other.getId();
  }

  hashCode(): string {
    return this.id;
  }
}
