import { Hardship } from '../../../../src/domain/value-objects/Hardship.vo';

describe('Hardship Value Object', () => {
  describe('Hardship.calculate()', () => {
    describe('SEVERE hardship detection', () => {
      it('should detect SEVERE hardship when bill is 25%+ of income', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 2000,
          totalExpenses: 1500,
          billAmount: 600, // 30% of income
          arrears: 0,
          vulnerabilities: {},
        });

        expect(hardship.isSevere()).toBe(true);
        expect(hardship.getLevel()).toBe('SEVERE');
      });

      it('should detect SEVERE hardship when customer has deficit budget', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 1500,
          totalExpenses: 2000, // Spending more than earning
          billAmount: 200,
          arrears: 0,
          vulnerabilities: {},
        });

        expect(hardship.isSevere()).toBe(true);
      });

      it('should detect SEVERE hardship when arrears > 3 months income', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 2000,
          totalExpenses: 1500,
          billAmount: 150,
          arrears: 7000, // 3.5 months
          vulnerabilities: {},
        });

        expect(hardship.isSevere()).toBe(true);
      });

      it('should detect SEVERE hardship with vulnerability flags', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 2000,
          totalExpenses: 1800,
          billAmount: 150,
          arrears: 1000,
          vulnerabilities: { pensioner: true, disabled: true, loneSupervisor: true },
        });

        expect(hardship.isSevere()).toBe(true);
      });
    });

    describe('MODERATE hardship detection', () => {
      it('should detect MODERATE hardship when bill is 10-25% of income', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 2000,
          totalExpenses: 1500,
          billAmount: 350, // 17.5% of income
          arrears: 0,
          vulnerabilities: {},
        });

        expect(hardship.isModerate()).toBe(true);
        expect(hardship.getLevel()).toBe('MODERATE');
      });

      it('should detect MODERATE hardship with tight budget and arrears', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 2000,
          totalExpenses: 1900,
          billAmount: 150,
          arrears: 2000, // 1 month arrears
          vulnerabilities: {},
        });

        expect(hardship.isModerate()).toBe(true);
      });
    });

    describe('LOW hardship detection', () => {
      it('should detect LOW hardship when bill is 5-10% of income', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 2000,
          totalExpenses: 1500,
          billAmount: 150, // 7.5% of income
          arrears: 0,
          vulnerabilities: {},
        });

        expect(hardship.isLow()).toBe(true);
        expect(hardship.getLevel()).toBe('LOW');
      });
    });

    describe('NO hardship detection', () => {
      it('should detect NO hardship when customer has strong finances', () => {
        const hardship = Hardship.calculate({
          monthlyIncome: 5000,
          totalExpenses: 2000,
          billAmount: 100, // 2% of income
          arrears: 0,
          vulnerabilities: {},
        });

        expect(hardship.isNone()).toBe(true);
        expect(hardship.getLevel()).toBe('NONE');
      });
    });

    it('should calculate correct confidence score', () => {
      const severeHardship = Hardship.calculate({
        monthlyIncome: 2000,
        totalExpenses: 1900,
        billAmount: 600,
        arrears: 0,
        vulnerabilities: {},
      });

      expect(severeHardship.getConfidenceScore()).toBeGreaterThan(0.7);

      const noneHardship = Hardship.calculate({
        monthlyIncome: 5000,
        totalExpenses: 2000,
        billAmount: 100,
        arrears: 0,
        vulnerabilities: {},
      });

      expect(noneHardship.getConfidenceScore()).toBeGreaterThan(0.7);
    });

    it('should calculate disposable income correctly', () => {
      const hardship = Hardship.calculate({
        monthlyIncome: 3000,
        totalExpenses: 2000,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: {},
      });

      expect(hardship.getDisposableIncome()).toBe(1000);
    });

    it('should handle zero income gracefully', () => {
      const hardship = Hardship.calculate({
        monthlyIncome: 0,
        totalExpenses: 0,
        billAmount: 0,
        arrears: 0,
        vulnerabilities: {},
      });

      expect(hardship.getBillPercentage()).toBe(0);
      expect(hardship.isNone()).toBe(true);
    });
  });

  describe('Hardship.reconstruct()', () => {
    it('should reconstruct hardship from persisted data', () => {
      const hardship = Hardship.reconstruct('SEVERE', 0.85, 500, 25);

      expect(hardship.getLevel()).toBe('SEVERE');
      expect(hardship.getConfidenceScore()).toBe(0.85);
      expect(hardship.getDisposableIncome()).toBe(500);
      expect(hardship.getBillPercentage()).toBe(25);
    });

    it('should throw error for invalid hardship level', () => {
      expect(() => {
        Hardship.reconstruct('INVALID' as any, 0.85, 500, 25);
      }).toThrow();
    });

    it('should throw error for invalid confidence score', () => {
      expect(() => {
        Hardship.reconstruct('SEVERE', 1.5, 500, 25);
      }).toThrow();
    });
  });

  describe('hasHighConfidence()', () => {
    it('should return true when confidence >= 0.7', () => {
      const hardship = Hardship.reconstruct('SEVERE', 0.75, 500, 25);
      expect(hardship.hasHighConfidence()).toBe(true);
    });

    it('should return false when confidence < 0.7', () => {
      const hardship = Hardship.reconstruct('LOW', 0.6, 500, 5);
      expect(hardship.hasHighConfidence()).toBe(false);
    });
  });

  describe('getSeverityRank()', () => {
    it('should return correct severity rankings', () => {
      const none = Hardship.calculate({
        monthlyIncome: 5000,
        totalExpenses: 2000,
        billAmount: 100,
        arrears: 0,
        vulnerabilities: {},
      });

      const low = Hardship.calculate({
        monthlyIncome: 2000,
        totalExpenses: 1500,
        billAmount: 150,
        arrears: 0,
        vulnerabilities: {},
      });

      const moderate = Hardship.calculate({
        monthlyIncome: 2000,
        totalExpenses: 1500,
        billAmount: 300,
        arrears: 0,
        vulnerabilities: {},
      });

      const severe = Hardship.calculate({
        monthlyIncome: 2000,
        totalExpenses: 1900,
        billAmount: 600,
        arrears: 0,
        vulnerabilities: {},
      });

      expect(none.getSeverityRank()).toBe(0);
      expect(low.getSeverityRank()).toBeLessThan(moderate.getSeverityRank());
      expect(moderate.getSeverityRank()).toBeLessThan(severe.getSeverityRank());
    });
  });

  describe('equals() and hashCode()', () => {
    it('should consider two hardships equal if all properties match', () => {
      const hardship1 = Hardship.reconstruct('SEVERE', 0.85, 500, 25);
      const hardship2 = Hardship.reconstruct('SEVERE', 0.85, 500, 25);

      expect(hardship1.equals(hardship2)).toBe(true);
    });

    it('should consider two hardships different if properties differ', () => {
      const hardship1 = Hardship.reconstruct('SEVERE', 0.85, 500, 25);
      const hardship2 = Hardship.reconstruct('MODERATE', 0.75, 500, 25);

      expect(hardship1.equals(hardship2)).toBe(false);
    });

    it('should generate same hash code for equal hardships', () => {
      const hardship1 = Hardship.reconstruct('SEVERE', 0.85, 500, 25);
      const hardship2 = Hardship.reconstruct('SEVERE', 0.85, 500, 25);

      expect(hardship1.hashCode()).toBe(hardship2.hashCode());
    });
  });

  describe('toString()', () => {
    it('should return readable string representation', () => {
      const hardship = Hardship.calculate({
        monthlyIncome: 2000,
        totalExpenses: 1900,
        billAmount: 600,
        arrears: 0,
        vulnerabilities: {},
      });

      const str = hardship.toString();
      expect(str).toContain('SEVERE');
      expect(str).toContain('Hardship');
    });
  });
});
