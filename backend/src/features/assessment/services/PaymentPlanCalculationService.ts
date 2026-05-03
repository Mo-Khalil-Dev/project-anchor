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
   * Calculate 3 payment plans based on disposable income, arrears, and monthly bill
   *
   * @param disposableIncome - Monthly disposable income (income - expenses including bill)
   * @param arrears - Outstanding debt to be repaid
   * @param monthlyBill - Current monthly bill amount
   * @returns Array of 3 payment plans
   */
  calculatePlans(disposableIncome: number, arrears: number, monthlyBill?: number): PaymentPlan[] {
    if (disposableIncome <= 0 || arrears <= 0) {
      return [];
    }

    const billRatio = monthlyBill ? (monthlyBill / disposableIncome) * 100 : 0;
    const isSevereBill = billRatio > 25;
    const isModeratedBill = billRatio > 10;

    // Formula 5: percentage allocations — adjusted for bill severity
    // If bill is SEVERE, use stricter percentages to account for higher risk
    const conservativePercent = isSevereBill ? 0.10 : 0.14; // 10% or 14%
    const balancedPercent = isSevereBill ? 0.12 : 0.18; // 12% or 18%
    const aggressivePercent = isSevereBill ? 0.14 : 0.20; // 14% or 20%

    const conservativeAmount = Math.round(disposableIncome * conservativePercent);
    const balancedAmount = Math.round(disposableIncome * balancedPercent);
    const aggressiveAmount = Math.round(disposableIncome * aggressivePercent);

    // Calculate durations based on arrears
    const conservativeDuration = Math.ceil(arrears / conservativeAmount);
    const balancedDuration = Math.ceil(arrears / balancedAmount);
    const aggressiveDuration = Math.ceil(arrears / aggressiveAmount);

    // Determine sustainability based on bill ratio
    const getConservativeSustainability = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
      if (isSevereBill) return 'MEDIUM';
      return 'HIGH';
    };

    const getBalancedSustainability = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
      if (isSevereBill) return 'LOW';
      if (isModeratedBill) return 'MEDIUM';
      return 'MEDIUM';
    };

    const getAggressiveSustainability = (): 'HIGH' | 'MEDIUM' | 'LOW' => {
      if (isSevereBill) return 'LOW';
      return 'MEDIUM';
    };

    return [
      {
        type: 'Conservative',
        monthlyAmount: conservativeAmount,
        duration: conservativeDuration,
        totalRepayment: arrears,
        sustainability: getConservativeSustainability(),
      },
      {
        type: 'Balanced',
        monthlyAmount: balancedAmount,
        duration: balancedDuration,
        totalRepayment: arrears,
        sustainability: getBalancedSustainability(),
      },
      {
        type: 'Aggressive',
        monthlyAmount: aggressiveAmount,
        duration: aggressiveDuration,
        totalRepayment: arrears,
        sustainability: getAggressiveSustainability(),
      },
    ];
  }
}
