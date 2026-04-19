import { Assessment } from '../../../../src/domain/entities/Assessment.entity';
import { DomainError } from '../../../../src/domain/errors/DomainError';

describe('Assessment Entity', () => {
  describe('Assessment.create()', () => {
    it('should create a valid assessment with all required fields', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2500,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 300,
        vulnerabilities: { pensioner: false, disabled: true },
        incomeBreakdown: { salary: 2500 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
      });

      expect(assessment.getId()).toBeDefined();
      expect(assessment.getCustomerId()).toBe('customer_123');
      expect(assessment.getMonthlyIncome()).toBe(2500);
      expect(assessment.getTotalExpenses()).toBe(2000);
    });

    it('should throw error if customer ID is missing', () => {
      expect(() => {
        Assessment.create({
          customerId: '',
          monthlyIncome: 2500,
          totalExpenses: 2000,
          billAmount: 150,
          arrears: 0,
          vulnerabilities: {},
          incomeBreakdown: { salary: 2500 },
          expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
        });
      }).toThrow(DomainError);
    });

    it('should throw error if monthly income is negative', () => {
      expect(() => {
        Assessment.create({
          customerId: 'customer_123',
          monthlyIncome: -100,
          totalExpenses: 2000,
          billAmount: 150,
          arrears: 0,
          vulnerabilities: {},
          incomeBreakdown: { salary: -100 },
          expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
        });
      }).toThrow(DomainError);
    });

    it('should throw error if income breakdown does not match total', () => {
      expect(() => {
        Assessment.create({
          customerId: 'customer_123',
          monthlyIncome: 2500,
          totalExpenses: 2000,
          billAmount: 150,
          arrears: 0,
          vulnerabilities: {},
          incomeBreakdown: { salary: 2000 }, // Only 2000, but total is 2500
          expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
        });
      }).toThrow(DomainError);
    });

    it('should throw error if expense breakdown does not match total', () => {
      expect(() => {
        Assessment.create({
          customerId: 'customer_123',
          monthlyIncome: 2500,
          totalExpenses: 2000,
          billAmount: 150,
          arrears: 0,
          vulnerabilities: {},
          incomeBreakdown: { salary: 2500 },
          expenseBreakdown: { housing: 1000, food: 500, utilities: 300 }, // Only 1800, but total is 2000
        });
      }).toThrow(DomainError);
    });

    it('should calculate hardship level during creation', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2000,
        totalExpenses: 1950,
        billAmount: 600, // 30% of income = SEVERE
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: { salary: 2000 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 150 },
      });

      expect(assessment.getHardship().isSevere()).toBe(true);
    });
  });

  describe('calculateDisposableIncome()', () => {
    it('should return positive disposable income when income > expenses', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 3000,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: { salary: 3000 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
      });

      expect(assessment.calculateDisposableIncome()).toBe(1000);
    });

    it('should return negative disposable income when expenses > income', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 1500,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: { salary: 1500 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
      });

      expect(assessment.calculateDisposableIncome()).toBe(-500);
    });
  });

  describe('calculateBillPercentageOfIncome()', () => {
    it('should correctly calculate bill as percentage of income', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2000,
        totalExpenses: 1500,
        billAmount: 200, // 10% of income
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: { salary: 2000 },
        expenseBreakdown: { housing: 1000, food: 500 },
      });

      expect(assessment.calculateBillPercentageOfIncome()).toBe(10);
    });

    it('should return 0 when income is 0', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 0,
        totalExpenses: 0,
        billAmount: 0,
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: {},
        expenseBreakdown: {},
      });

      expect(assessment.calculateBillPercentageOfIncome()).toBe(0);
    });
  });

  describe('isVulnerable()', () => {
    it('should return true if any vulnerability flag is true', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2500,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: { pensioner: true, disabled: false },
        incomeBreakdown: { salary: 2500 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
      });

      expect(assessment.isVulnerable()).toBe(true);
    });

    it('should return false if all vulnerability flags are false', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2500,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: { pensioner: false, disabled: false },
        incomeBreakdown: { salary: 2500 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
      });

      expect(assessment.isVulnerable()).toBe(false);
    });
  });

  describe('requiresManualReview()', () => {
    it('should return true for SEVERE hardship', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2000,
        totalExpenses: 1900,
        billAmount: 600, // 30% of income
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: { salary: 2000 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 100 },
      });

      expect(assessment.requiresManualReview()).toBe(true);
    });

    it('should return true for significant arrears (>3 months income)', () => {
      const assessment = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2000,
        totalExpenses: 1500,
        billAmount: 150,
        arrears: 7000, // >3 months of income
        vulnerabilities: {},
        incomeBreakdown: { salary: 2000 },
        expenseBreakdown: { housing: 1000, food: 500 },
      });

      expect(assessment.requiresManualReview()).toBe(true);
    });
  });

  describe('equals() and hashCode()', () => {
    it('should consider two assessments equal if they have the same ID', () => {
      const assessment1 = Assessment.create({
        customerId: 'customer_123',
        monthlyIncome: 2500,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: {},
        incomeBreakdown: { salary: 2500 },
        expenseBreakdown: { housing: 1000, food: 500, utilities: 300, other: 200 },
      });

      const assessment2 = Assessment.fromPersistence({
        id: assessment1.getId(),
        customerId: assessment1.getCustomerId(),
        monthlyIncome: assessment1.getMonthlyIncome(),
        totalExpenses: assessment1.getTotalExpenses(),
        billAmount: assessment1.getBillAmount(),
        arrears: assessment1.getArrears(),
        vulnerabilities: assessment1.getVulnerabilities(),
        incomeBreakdown: assessment1.getIncomeBreakdown(),
        expenseBreakdown: assessment1.getExpenseBreakdown(),
        hardship: assessment1.getHardship(),
        createdAt: assessment1.getCreatedAt(),
        updatedAt: assessment1.getUpdatedAt(),
      });

      expect(assessment1.equals(assessment2)).toBe(true);
      expect(assessment1.hashCode()).toBe(assessment2.hashCode());
    });
  });
});
