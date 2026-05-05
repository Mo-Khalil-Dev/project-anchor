import { PaymentPlanCalculationService } from './PaymentPlanCalculationService';

describe('PaymentPlanCalculationService', () => {
  const service = new PaymentPlanCalculationService();

  describe('calculatePlans', () => {
    it('should calculate 3 payment plans with correct amounts', () => {
      const disposableIncome = 500;
      const arrears = 1000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      expect(plans).toHaveLength(3);
      expect(plans[0].type).toBe('Conservative');
      expect(plans[1].type).toBe('Balanced');
      expect(plans[2].type).toBe('Aggressive');
    });

    it('should apply formula: monthly = disposable * percentage', () => {
      const disposableIncome = 1000;
      const arrears = 5000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      // Conservative: 1000 * 0.14 = 140
      expect(plans[0].monthlyAmount).toBe(140);
      // Balanced: 1000 * 0.18 = 180
      expect(plans[1].monthlyAmount).toBe(180);
      // Aggressive: 1000 * 0.20 = 200
      expect(plans[2].monthlyAmount).toBe(200);
    });

    it('should calculate correct duration based on arrears and monthly amount', () => {
      const disposableIncome = 500;
      const arrears = 1000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      // Conservative: 1000 / 70 ≈ 14.3 months → ceil = 15
      expect(plans[0].duration).toBeGreaterThanOrEqual(14);
      expect(plans[0].duration).toBeLessThanOrEqual(15);

      // Aggressive pays faster
      expect(plans[2].duration).toBeLessThan(plans[0].duration);
    });

    it('should set sustainability based on monthly amount vs disposable income', () => {
      const disposableIncome = 500;
      const arrears = 1000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      // Conservative: 70 < 500 → HIGH
      expect(plans[0].sustainability).toBe('HIGH');

      // Balanced: 90 < 500 → MEDIUM (typically)
      expect(['HIGH', 'MEDIUM']).toContain(plans[1].sustainability);

      // Aggressive: closer to limit → LOW or MEDIUM
      expect(['MEDIUM', 'LOW']).toContain(plans[2].sustainability);
    });

    it('should return empty array if disposable income is 0 or negative', () => {
      const plans1 = service.calculatePlans(0, 1000);
      const plans2 = service.calculatePlans(-100, 1000);

      expect(plans1).toEqual([]);
      expect(plans2).toEqual([]);
    });

    it('should handle small disposable income correctly', () => {
      const disposableIncome = 50;
      const arrears = 1000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      // Conservative: 50 * 0.14 = 7
      expect(plans[0].monthlyAmount).toBe(7);
      expect(plans[0].sustainability).toBe('HIGH');
    });

    it('should calculate totalRepayment correctly', () => {
      const disposableIncome = 1000;
      const arrears = 2000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      plans.forEach((plan: any) => {
        // totalRepayment should roughly equal arrears (allowing for rounding)
        expect(Math.abs(plan.totalRepayment - arrears)).toBeLessThanOrEqual(plan.monthlyAmount);
      });
    });

    it('should handle large arrears amount', () => {
      const disposableIncome = 5000;
      const arrears = 50000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      expect(plans).toHaveLength(3);
      expect(plans[0].duration).toBeGreaterThan(10);
      expect(plans[2].duration).toBeLessThan(plans[0].duration);
    });

    it('conservative plan should have lowest monthly payment and highest duration', () => {
      const disposableIncome = 2000;
      const arrears = 10000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      expect(plans[0].monthlyAmount).toBeLessThan(plans[1].monthlyAmount);
      expect(plans[1].monthlyAmount).toBeLessThan(plans[2].monthlyAmount);

      expect(plans[0].duration).toBeGreaterThan(plans[1].duration);
      expect(plans[1].duration).toBeGreaterThan(plans[2].duration);
    });

    it('all plans should have type, monthlyAmount, duration, totalRepayment, and sustainability', () => {
      const disposableIncome = 1000;
      const arrears = 5000;

      const plans = service.calculatePlans(disposableIncome, arrears);

      plans.forEach((plan: any) => {
        expect(plan).toHaveProperty('type');
        expect(plan).toHaveProperty('monthlyAmount');
        expect(plan).toHaveProperty('duration');
        expect(plan).toHaveProperty('totalRepayment');
        expect(plan).toHaveProperty('sustainability');

        expect(typeof plan.monthlyAmount).toBe('number');
        expect(typeof plan.duration).toBe('number');
        expect(typeof plan.totalRepayment).toBe('number');
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(plan.sustainability);
      });
    });
  });
});
