import { DomainError } from '../errors/DomainError';

export type HardshipLevel = 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';

export interface HardshipCalculationProps {
  monthlyIncome: number;
  totalExpenses: number;
  billAmount: number;
  arrears: number;
  vulnerabilities: Record<string, boolean>;
}

/**
 * Hardship Value Object
 *
 * Immutable representation of a customer's hardship level.
 * Encapsulates calculation logic and immutability guarantees.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only calculates and represents hardship
 * - Open/Closed: Business rules are encapsulated, not exposed
 * - Liskov Substitution: Immutable contract guarantees
 * - Interface Segregation: Only necessary public methods
 * - Dependency Inversion: No external dependencies
 */
export class Hardship {
  private readonly level: HardshipLevel;
  private readonly confidenceScore: number;
  private readonly disposableIncome: number;
  private readonly billPercentage: number;

  // Default thresholds (can be overridden by policy)
  private static readonly THRESHOLDS = {
    SEVERE_THRESHOLD: 25, // Bill is 25%+ of income
    MODERATE_THRESHOLD: 10,
    LOW_THRESHOLD: 5,
    DEFICIT_WEIGHT: 2, // Double weight for negative disposable income
  };

  private constructor(
    level: HardshipLevel,
    confidenceScore: number,
    disposableIncome: number,
    billPercentage: number
  ) {
    this.level = level;
    this.confidenceScore = confidenceScore;
    this.disposableIncome = disposableIncome;
    this.billPercentage = billPercentage;
  }

  /**
   * Factory method to calculate hardship from customer financial data.
   * This is where the complex hardship detection logic lives.
   */
  static calculate(props: HardshipCalculationProps): Hardship {
    const disposableIncome = props.monthlyIncome - props.totalExpenses;
    const billPercentage =
      props.monthlyIncome > 0 ? (props.billAmount / props.monthlyIncome) * 100 : 0;

    // Calculate hardship score (0-100)
    let hardshipScore = 0;

    // 1. Bill as percentage of income (primary indicator)
    //    - 0-5% = low stress
    //    - 5-10% = moderate stress
    //    - 10-25% = high stress
    //    - 25%+ = severe stress
    if (billPercentage >= Hardship.THRESHOLDS.SEVERE_THRESHOLD) {
      hardshipScore += 50;
    } else if (billPercentage >= Hardship.THRESHOLDS.MODERATE_THRESHOLD) {
      hardshipScore += 30;
    } else if (billPercentage >= Hardship.THRESHOLDS.LOW_THRESHOLD) {
      hardshipScore += 10;
    }

    // 2. Disposable income (secondary indicator)
    //    - Positive disposable income reduces hardship
    //    - Negative (deficit) significantly increases it
    if (disposableIncome < 0) {
      // Customer spending more than they earn
      hardshipScore += 40 * Hardship.THRESHOLDS.DEFICIT_WEIGHT;
    } else if (disposableIncome < props.monthlyIncome * 0.1) {
      // Less than 10% disposable income = tight budget
      hardshipScore += 20;
    }

    // 3. Arrears (indicates past struggle)
    //    - Arrears > 3 months income indicates structural hardship
    if (props.arrears > props.monthlyIncome * 3) {
      hardshipScore += 30;
    } else if (props.arrears > props.monthlyIncome) {
      hardshipScore += 15;
    }

    // 4. Vulnerability flags (age, medical conditions, etc.)
    //    - Each vulnerability flag adds weight
    const vulnerabilityCount = Object.values(props.vulnerabilities).filter((v) => v).length;
    hardshipScore += vulnerabilityCount * 5;

    // Normalize to 0-100
    hardshipScore = Math.min(hardshipScore, 100);

    // Determine level from score
    let level: HardshipLevel;
    let confidenceScore: number;

    if (hardshipScore >= 75) {
      level = 'SEVERE';
      confidenceScore = Math.min(hardshipScore / 100, 1);
    } else if (hardshipScore >= 50) {
      level = 'MODERATE';
      confidenceScore = Math.min(hardshipScore / 100, 1);
    } else if (hardshipScore >= 25) {
      level = 'LOW';
      confidenceScore = Math.min(hardshipScore / 100, 0.8);
    } else {
      level = 'NONE';
      confidenceScore = Math.min((100 - hardshipScore) / 100, 0.9);
    }

    return new Hardship(level, confidenceScore, disposableIncome, billPercentage);
  }

  /**
   * Reconstruct Hardship from persisted data.
   * Used by repository when loading from database.
   */
  static reconstruct(
    level: HardshipLevel,
    confidenceScore: number,
    disposableIncome: number,
    billPercentage: number
  ): Hardship {
    if (!['NONE', 'LOW', 'MODERATE', 'SEVERE'].includes(level)) {
      throw new DomainError('INVALID_HARDSHIP_LEVEL', `Invalid hardship level: ${level}`);
    }

    if (confidenceScore < 0 || confidenceScore > 1) {
      throw new DomainError('INVALID_CONFIDENCE_SCORE', 'Confidence score must be between 0 and 1');
    }

    return new Hardship(level, confidenceScore, disposableIncome, billPercentage);
  }

  // ========== Getters ==========

  getLevel(): HardshipLevel {
    return this.level;
  }

  getConfidenceScore(): number {
    return this.confidenceScore;
  }

  getDisposableIncome(): number {
    return this.disposableIncome;
  }

  getBillPercentage(): number {
    return this.billPercentage;
  }

  // ========== Query Methods ==========

  isSevere(): boolean {
    return this.level === 'SEVERE';
  }

  isModerate(): boolean {
    return this.level === 'MODERATE';
  }

  isLow(): boolean {
    return this.level === 'LOW';
  }

  isNone(): boolean {
    return this.level === 'NONE';
  }

  /**
   * Check if confidence in this assessment is high enough
   * for automated decision-making.
   */
  hasHighConfidence(): boolean {
    return this.confidenceScore >= 0.7;
  }

  /**
   * Get severity ranking (0-3, where 3 is SEVERE).
   * Useful for sorting and prioritization.
   */
  getSeverityRank(): number {
    switch (this.level) {
      case 'SEVERE':
        return 3;
      case 'MODERATE':
        return 2;
      case 'LOW':
        return 1;
      case 'NONE':
        return 0;
    }
  }

  // ========== Equality and Hashing ==========

  /**
   * Value objects are equal if all their properties are equal.
   * (Not reference equality)
   */
  equals(other: Hardship): boolean {
    return (
      this.level === other.level &&
      this.confidenceScore === other.confidenceScore &&
      this.disposableIncome === other.disposableIncome &&
      this.billPercentage === other.billPercentage
    );
  }

  hashCode(): string {
    return `${this.level}_${this.confidenceScore}_${this.disposableIncome}_${this.billPercentage}`;
  }

  // ========== String Representation ==========

  toString(): string {
    return `Hardship(level=${this.level}, confidence=${this.confidenceScore.toFixed(2)})`;
  }
}
