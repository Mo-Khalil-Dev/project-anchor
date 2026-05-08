import { PlanSpecification } from '@/features/assessment/domain/entities';
import {
  SUSTAINABILITY_SCORE,
  type SustainabilityScore,
} from '@/features/assessment/domain/entities/sustainability-score';
import { PLAN_TYPE } from '@/features/assessment/domain/entities/plan-type';

/**
 * PaymentPlanCalculationService
 *
 * Calculates 3 payment plan options based on disposable income.
 * Uses Formula 5: Conservative (14%), Balanced (18%), Aggressive (20%)
 *
 * Returns domain value objects (PlanSpecification) ready to persist.
 */
export class PaymentPlanCalculationService {
  /**
   * Calculate 3 payment plans based on disposable income, arrears, and monthly bill
   *
   * @param disposableIncome - Monthly disposable income (income - expenses including bill)
   * @param arrears - Outstanding debt to be repaid
   * @param monthlyBill - Current monthly bill amount
   * @returns Array of 3 PlanSpecification value objects
   */
  calculatePlans(disposableIncome: number, arrears: number, monthlyBill?: number): PlanSpecification[] {
    if (disposableIncome <= 0 || arrears <= 0) {
      return [];
    }

    const billRatio = monthlyBill ? (monthlyBill / disposableIncome) * 100 : 0;
    const isSevereBill = billRatio > 25;
    const isModeratedBill = billRatio > 10;

    // Formula 5: percentage allocations — adjusted for bill severity
    // If bill is SEVERE, use stricter percentages to account for higher risk
    const conservativePercent = isSevereBill ? 0.1 : 0.14; // 10% or 14%
    const balancedPercent = isSevereBill ? 0.12 : 0.18; // 12% or 18%
    const aggressivePercent = isSevereBill ? 0.14 : 0.2; // 14% or 20%

    const conservativeAmount = Math.round(disposableIncome * conservativePercent);
    const balancedAmount = Math.round(disposableIncome * balancedPercent);
    const aggressiveAmount = Math.round(disposableIncome * aggressivePercent);

    // Calculate durations based on arrears
    const conservativeDuration = Math.ceil(arrears / conservativeAmount);
    const balancedDuration = Math.ceil(arrears / balancedAmount);
    const aggressiveDuration = Math.ceil(arrears / aggressiveAmount);

    // Determine sustainability based on bill ratio
    const getConservativeSustainability = (): SustainabilityScore => {
      if (isSevereBill) return SUSTAINABILITY_SCORE.MEDIUM;
      return SUSTAINABILITY_SCORE.HIGH;
    };

    const getBalancedSustainability = (): SustainabilityScore => {
      if (isSevereBill) return SUSTAINABILITY_SCORE.LOW;
      if (isModeratedBill) return SUSTAINABILITY_SCORE.MEDIUM;
      return SUSTAINABILITY_SCORE.MEDIUM;
    };

    const getAggressiveSustainability = (): SustainabilityScore => {
      if (isSevereBill) return SUSTAINABILITY_SCORE.LOW;
      return SUSTAINABILITY_SCORE.MEDIUM;
    };

    return [
      PlanSpecification.create({
        type: PLAN_TYPE.CONSERVATIVE,
        monthlyAmount: conservativeAmount,
        duration: conservativeDuration,
        totalRepayment: arrears,
        sustainability: getConservativeSustainability(),
      }),
      PlanSpecification.create({
        type: PLAN_TYPE.BALANCED,
        monthlyAmount: balancedAmount,
        duration: balancedDuration,
        totalRepayment: arrears,
        sustainability: getBalancedSustainability(),
      }),
      PlanSpecification.create({
        type: PLAN_TYPE.AGGRESSIVE,
        monthlyAmount: aggressiveAmount,
        duration: aggressiveDuration,
        totalRepayment: arrears,
        sustainability: getAggressiveSustainability(),
      }),
    ];
  }
}
