/**
 * PaymentPlanCalculationService
 *
 * Calculates 3 payment plan options based on disposable income.
 * Uses Formula 5: Conservative (14%), Balanced (18%), Aggressive (20%)
 *
 * Plans include: type, monthlyAmount, duration, totalRepayment, sustainability
 */

export interface PaymentPlan {
  type: 'Conservative' | 'Balanced' | 'Aggressive';
  monthlyAmount: number;
  duration: number; // months
  totalRepayment: number;
  sustainability: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class PaymentPlanCalculationService {
  /**
   * Calculate 3 payment plans based on disposable income and arrears
   *
   * @param disposableIncome - Monthly disposable income (income - expenses)
   * @param arrears - Outstanding debt to be repaid
   * @returns Array of 3 payment plans
   */
  calculatePlans(disposableIncome: number, arrears: number): PaymentPlan[] {
    if (disposableIncome <= 0 || arrears <= 0) {
      return [];
    }

    // Formula 5: percentage allocations
    const conservativePercent = 0.14; // 14% - high safety margin
    const balancedPercent = 0.18; // 18% - medium safety margin
    const aggressivePercent = 0.20; // 20% - low safety margin

    const conservativeAmount = Math.round(disposableIncome * conservativePercent);
    const balancedAmount = Math.round(disposableIncome * balancedPercent);
    const aggressiveAmount = Math.round(disposableIncome * aggressivePercent);

    // Calculate durations based on arrears
    const conservativeDuration = Math.ceil(arrears / conservativeAmount);
    const balancedDuration = Math.ceil(arrears / balancedAmount);
    const aggressiveDuration = Math.ceil(arrears / aggressiveAmount);

    return [
      {
        type: 'Conservative',
        monthlyAmount: conservativeAmount,
        duration: conservativeDuration,
        totalRepayment: arrears,
        sustainability: 'HIGH',
      },
      {
        type: 'Balanced',
        monthlyAmount: balancedAmount,
        duration: balancedDuration,
        totalRepayment: arrears,
        sustainability: 'MEDIUM',
      },
      {
        type: 'Aggressive',
        monthlyAmount: aggressiveAmount,
        duration: aggressiveDuration,
        totalRepayment: arrears,
        sustainability: 'MEDIUM',
      },
    ];
  }
}
