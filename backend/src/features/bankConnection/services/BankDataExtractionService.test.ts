import { BankDataExtractionService } from './BankDataExtractionService';

describe('BankDataExtractionService', () => {
  describe('extractIncome', () => {
    it('should extract income correctly from valid Tink response', () => {
      const tinkData = {
        income: {
          streams: [
            {
              type: 'SALARY',
              summaryByMonths: {
                lastSixMonths: {
                  mean: {
                    unscaledValue: '300000',
                    scale: '2',
                  },
                },
              },
            },
          ],
        },
      };

      const result = BankDataExtractionService.extractIncome(tinkData);

      expect(result.isOk).toBe(true);
      const income = result.getOrThrow();
      expect(income.salary).toBe(3000);
      expect(income.total).toBe(3000);
    });

    it('should handle multiple income streams', () => {
      const tinkData = {
        income: {
          streams: [
            {
              type: 'SALARY',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '300000', scale: '2' },
                },
              },
            },
            {
              type: 'PENSION',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '50000', scale: '2' },
                },
              },
            },
          ],
        },
      };

      const result = BankDataExtractionService.extractIncome(tinkData);
      const income = result.getOrThrow();

      expect(income.salary).toBe(3000);
      expect(income.pension).toBe(500);
      expect(income.total).toBe(3500);
    });

    it('should categorize income by type correctly', () => {
      const tinkData = {
        income: {
          streams: [
            {
              type: 'BENEFITS',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '100000', scale: '2' },
                },
              },
            },
            {
              type: 'CASH_DEPOSITS',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '50000', scale: '2' },
                },
              },
            },
            {
              type: 'OTHER',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '25000', scale: '2' },
                },
              },
            },
          ],
        },
      };

      const result = BankDataExtractionService.extractIncome(tinkData);
      const income = result.getOrThrow();

      expect(income.benefits).toBe(1000);
      expect(income.cashDeposits).toBe(500);
      expect(income.other).toBe(250);
      expect(income.total).toBe(1750);
    });

    it('should use default response when input is undefined', () => {
      const result = BankDataExtractionService.extractIncome(undefined);

      expect(result.isOk).toBe(true);
      const income = result.getOrThrow();
      expect(income.salary).toBe(3000);
      expect(income.total).toBe(3000);
    });

    it('should fail when streams array is missing', () => {
      const result = BankDataExtractionService.extractIncome({
        income: {},
      });

      expect(result.isFail).toBe(true);
    });

    it('should skip streams with missing data', () => {
      const tinkData = {
        income: {
          streams: [
            {
              type: 'SALARY',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '300000', scale: '2' },
                },
              },
            },
            {
              type: 'PENSION',
              summaryByMonths: {
                lastSixMonths: {},
              },
            },
          ],
        },
      };

      const result = BankDataExtractionService.extractIncome(tinkData);
      const income = result.getOrThrow();

      expect(income.salary).toBe(3000);
      expect(income.pension).toBe(0);
      expect(income.total).toBe(3000);
    });

    it('should handle negative values (absolute value)', () => {
      const tinkData = {
        income: {
          streams: [
            {
              type: 'SALARY',
              summaryByMonths: {
                lastSixMonths: {
                  mean: { unscaledValue: '-300000', scale: '2' },
                },
              },
            },
          ],
        },
      };

      const result = BankDataExtractionService.extractIncome(tinkData);
      const income = result.getOrThrow();

      expect(income.salary).toBe(3000);
    });
  });

  describe('extractExpenses', () => {
    it('should extract expenses correctly from valid Tink response', () => {
      const tinkData = {
        expenses: {
          housing: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-80000', scale: '2' },
                },
              },
            },
          },
          groceries: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-40000', scale: '2' },
                },
              },
            },
          },
        },
      };

      const result = BankDataExtractionService.extractExpenses(tinkData);

      expect(result.isOk).toBe(true);
      const expenses = result.getOrThrow();
      expect(expenses.housing).toBe(800);
      expect(expenses.food).toBe(400);
      expect(expenses.total).toBe(1200);
    });

    it('should map all Tink categories correctly', () => {
      const tinkData = {
        expenses: {
          housing: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-100000', scale: '2' },
                },
              },
            },
          },
          groceries: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-50000', scale: '2' },
                },
              },
            },
          },
          utilities: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-30000', scale: '2' },
                },
              },
            },
          },
          transportation: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-40000', scale: '2' },
                },
              },
            },
          },
          childRelated: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-20000', scale: '2' },
                },
              },
            },
          },
        },
      };

      const result = BankDataExtractionService.extractExpenses(tinkData);
      const expenses = result.getOrThrow();

      expect(expenses.housing).toBe(1000);
      expect(expenses.food).toBe(500);
      expect(expenses.utilities).toBe(300);
      expect(expenses.transport).toBe(400);
      expect(expenses.other).toBe(200);
      expect(expenses.total).toBe(2400);
    });

    it('should use default response when input is undefined', () => {
      const result = BankDataExtractionService.extractExpenses(undefined);

      expect(result.isOk).toBe(true);
      const expenses = result.getOrThrow();
      expect(expenses.housing).toBe(800);
      expect(expenses.total).toBe(2100);
    });

    it('should fail when expenses object is missing', () => {
      const result = BankDataExtractionService.extractExpenses({});

      expect(result.isFail).toBe(true);
    });

    it('should skip categories with missing data', () => {
      const tinkData = {
        expenses: {
          housing: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-100000', scale: '2' },
                },
              },
            },
          },
          groceries: {
            summaries: {
              summariesByMonth: {},
            },
          },
        },
      };

      const result = BankDataExtractionService.extractExpenses(tinkData);
      const expenses = result.getOrThrow();

      expect(expenses.housing).toBe(1000);
      expect(expenses.food).toBe(0);
      expect(expenses.total).toBe(1000);
    });

    it('should handle all unmapped categories as other', () => {
      const tinkData = {
        expenses: {
          insurance: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-50000', scale: '2' },
                },
              },
            },
          },
          healthcare: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-30000', scale: '2' },
                },
              },
            },
          },
        },
      };

      const result = BankDataExtractionService.extractExpenses(tinkData);
      const expenses = result.getOrThrow();

      expect(expenses.other).toBe(800);
      expect(expenses.total).toBe(800);
    });

    it('should round totals to 2 decimal places', () => {
      const tinkData = {
        expenses: {
          housing: {
            summaries: {
              summariesByMonth: {
                lastSixMonths: {
                  mean: { unscaledValue: '-80001', scale: '2' },
                },
              },
            },
          },
        },
      };

      const result = BankDataExtractionService.extractExpenses(tinkData);
      const expenses = result.getOrThrow();

      expect(expenses.housing).toBe(800.01);
      expect(expenses.total).toBe(800.01);
    });
  });
});
