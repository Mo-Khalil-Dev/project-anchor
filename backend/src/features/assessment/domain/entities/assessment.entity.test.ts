import { Assessment } from './assessment.entity';
import { ASSESSMENT_STATUS } from './assessment-status';
import { HARDSHIP_LEVEL } from './hardship-level';
import { SUSTAINABILITY_SCORE } from './sustainability-score';

describe('Assessment Entity', () => {
  const mockProps = {
    id: 'assessment-1',
    customerId: 'customer-1',
    bankConnectionId: 'bank-1',
    monthlyIncome: 3000,
    monthlyExpenses: 2000,
    monthlyBill: 100,
    arrears: 500,
    status: ASSESSMENT_STATUS.COMPLETED,
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-21'),
  };

  describe('create', () => {
    it('should initialize createdAt and updatedAt timestamps', () => {
      const assessment = Assessment.create({
        id: 'assessment-create-1',
        customerId: 'customer-create-1',
        bankConnectionId: null,
        monthlyIncome: 2500,
        monthlyExpenses: 1800,
        monthlyBill: 120,
        arrears: 200,
        incomeBreakdown: null,
        expenseBreakdown: null,
        expensesByCategory: null,
        incomeHistory: null,
        incomeSources: null,
        factors: null,
        paymentPlans: null,
        selectedPlan: null,
        status: ASSESSMENT_STATUS.PENDING,
      });

      expect(assessment.getStatus()).toBe(ASSESSMENT_STATUS.PENDING);
      expect(assessment.getCreatedAt()).toBeInstanceOf(Date);
      expect(assessment.getUpdatedAt()).toBeInstanceOf(Date);
      expect(assessment.getUpdatedAt().getTime()).toBe(assessment.getCreatedAt().getTime());
    });
  });

  describe('calculateDisposableIncome', () => {
    it('should calculate disposable income correctly', () => {
      const assessment = new Assessment(mockProps);
      expect(assessment.calculateDisposableIncome()).toBe(1000);
    });

    it('should handle negative disposable income', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 4000,
      });
      expect(assessment.calculateDisposableIncome()).toBe(-1000);
    });

    it('should round to 2 decimal places', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyIncome: 3000.456,
        monthlyExpenses: 2000.789,
      });
      const result = assessment.calculateDisposableIncome();
      expect(result).toBe(999.67);
    });

    it('should handle zero disposable income', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 3000,
      });
      expect(assessment.calculateDisposableIncome()).toBe(0);
    });
  });

  describe('calculateBillRatio', () => {
    it('should calculate bill ratio as percentage correctly', () => {
      const assessment = new Assessment(mockProps);
      // (100 / 1000) * 100 = 10%
      expect(assessment.calculateBillRatio()).toBe(10);
    });

    it('should return POSITIVE_INFINITY when disposable income is 0', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 3000,
      });
      expect(assessment.calculateBillRatio()).toBe(Number.POSITIVE_INFINITY);
    });

    it('should return POSITIVE_INFINITY when disposable income is negative', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 4000,
      });
      expect(assessment.calculateBillRatio()).toBe(Number.POSITIVE_INFINITY);
    });

    it('should round to 2 decimal places', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 111.11,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      const result = assessment.calculateBillRatio();
      expect(result).toBeCloseTo(11.11, 2);
    });

    it('should handle large bill ratios', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 5000,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.calculateBillRatio()).toBe(500);
    });
  });

  describe('getHardshipLevel', () => {
    it('should return SEVERE when ratio > 25%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 300,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.SEVERE);
    });

    it('should return SEVERE when disposable income <= 0', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 3000,
        monthlyBill: 100,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.SEVERE);
    });

    it('should return MODERATE when ratio between 10-25%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 150,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.MODERATE);
    });

    it('should return LOW when ratio between 5-10%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 75,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.LOW);
    });

    it('should return NONE when ratio < 5%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 40,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.NONE);
    });

    it('should return NONE when ratio = 0', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 0,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.NONE);
    });

    it('should return SEVERE when ratio > 100% (INFINITE)', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 3000,
        monthlyBill: 100,
      });
      expect(assessment.getHardshipLevel()).toBe(HARDSHIP_LEVEL.SEVERE);
    });
  });

  describe('getSustainabilityScore', () => {
    it('should return LOW when disposable income <= 0', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyExpenses: 3000,
      });
      expect(assessment.getSustainabilityScore()).toBe(SUSTAINABILITY_SCORE.LOW);
    });

    it('should return LOW when ratio > 100%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 5000,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getSustainabilityScore()).toBe(SUSTAINABILITY_SCORE.LOW);
    });

    it('should return MEDIUM when ratio between 25-100%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 300,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getSustainabilityScore()).toBe(SUSTAINABILITY_SCORE.MEDIUM);
    });

    it('should return HIGH when ratio between 10-25%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 150,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getSustainabilityScore()).toBe(SUSTAINABILITY_SCORE.HIGH);
    });

    it('should return HIGH when ratio < 10%', () => {
      const assessment = new Assessment({
        ...mockProps,
        monthlyBill: 50,
        monthlyIncome: 3000,
        monthlyExpenses: 2000,
      });
      expect(assessment.getSustainabilityScore()).toBe(SUSTAINABILITY_SCORE.HIGH);
    });
  });

  describe('markAsCompleted', () => {
    it('should change status to COMPLETED', () => {
      const assessment = new Assessment({
        ...mockProps,
        status: ASSESSMENT_STATUS.PENDING,
      });
      assessment.markAsCompleted();
      expect(assessment.getStatus()).toBe(ASSESSMENT_STATUS.COMPLETED);
    });

    it('should update timestamp', () => {
      const assessment = new Assessment(mockProps);
      const before = assessment.getUpdatedAt();
      assessment.markAsCompleted();
      const after = assessment.getUpdatedAt();
      expect(after.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('markAsFailed', () => {
    it('should change status to FAILED', () => {
      const assessment = new Assessment({
        ...mockProps,
        status: ASSESSMENT_STATUS.PENDING,
      });
      assessment.markAsFailed();
      expect(assessment.getStatus()).toBe(ASSESSMENT_STATUS.FAILED);
    });

    it('should update timestamp', () => {
      const assessment = new Assessment(mockProps);
      const before = assessment.getUpdatedAt();
      assessment.markAsFailed();
      const after = assessment.getUpdatedAt();
      expect(after.getTime()).toBeGreaterThan(before.getTime());
    });
  });

  describe('Getters', () => {
    it('should return all properties correctly', () => {
      const assessment = new Assessment(mockProps);
      expect(assessment.getId()).toBe('assessment-1');
      expect(assessment.getCustomerId()).toBe('customer-1');
      expect(assessment.getBankConnectionId()).toBe('bank-1');
      expect(assessment.getMonthlyIncome()).toBe(3000);
      expect(assessment.getMonthlyExpenses()).toBe(2000);
      expect(assessment.getMonthlyBill()).toBe(100);
      expect(assessment.getArrears()).toBe(500);
      expect(assessment.getStatus()).toBe(ASSESSMENT_STATUS.COMPLETED);
    });

    it('should return null for optional fields when not provided', () => {
      const assessment = new Assessment({
        ...mockProps,
        bankConnectionId: undefined,
        arrears: undefined,
      });
      expect(assessment.getBankConnectionId()).toBeNull();
      expect(assessment.getArrears()).toBeNull();
    });
  });
});
