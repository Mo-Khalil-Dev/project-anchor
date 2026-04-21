import { Result } from '../../shared/result';

export interface IncomeBreakdown {
  salary: number;
  pension: number;
  benefits: number;
  cashDeposits: number;
  other: number;
  total: number;
}

export interface ExpenseBreakdown {
  housing: number;
  food: number;
  utilities: number;
  transport: number;
  other: number;
  total: number;
}

export class BankDataExtractionService {
  /**
   * Decode scaled decimal value from Tink API
   * unscaledValue / 10^scale
   */
  private static decodeScaledValue(unscaledValue: string, scale: string): number {
    const value = BigInt(unscaledValue);
    const scaleNum = parseInt(scale, 10);
    const divisor = BigInt(10) ** BigInt(scaleNum);
    const decimalValue = Number(value) / Number(divisor);
    return Math.round(decimalValue * 100) / 100;
  }

  /**
   * Extract income breakdown from Tink response
   * Reads lastSixMonths.mean from each stream and categorizes by type
   */
  static extractIncome(tinkResponse?: any): Result<IncomeBreakdown, Error> {
    // Default mock data: £3,000/month salary income
    const defaultResponse = tinkResponse || {
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
    try {
      if (!defaultResponse?.income?.streams || !Array.isArray(defaultResponse.income.streams)) {
        return Result.fail(new Error('Invalid income data structure'));
      }

      const breakdown: IncomeBreakdown = {
        salary: 0,
        pension: 0,
        benefits: 0,
        cashDeposits: 0,
        other: 0,
        total: 0,
      };

      for (const stream of defaultResponse.income.streams) {
        const mean = stream?.summaryByMonths?.lastSixMonths?.mean;

        if (!mean || !mean.unscaledValue || !mean.scale) {
          continue;
        }

        const amount = Math.abs(this.decodeScaledValue(mean.unscaledValue, mean.scale));
        const streamType = (stream.type || 'OTHER').toUpperCase();

        switch (streamType) {
          case 'SALARY':
            breakdown.salary += amount;
            break;
          case 'PENSION':
            breakdown.pension += amount;
            break;
          case 'BENEFITS':
            breakdown.benefits += amount;
            break;
          case 'CASH_DEPOSITS':
            breakdown.cashDeposits += amount;
            break;
          default:
            breakdown.other += amount;
        }
      }

      breakdown.total =
        breakdown.salary +
        breakdown.pension +
        breakdown.benefits +
        breakdown.cashDeposits +
        breakdown.other;
      breakdown.total = Math.round(breakdown.total * 100) / 100;

      return Result.ok(breakdown);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error extracting income';
      return Result.fail(new Error(message));
    }
  }

  /**
   * Extract expense breakdown from Tink response
   * Reads lastSixMonths.mean from each category and maps to budget buckets
   */
  static extractExpenses(tinkResponse?: any): Result<ExpenseBreakdown, Error> {
    // Default mock data: realistic GB expenses (£2,100/month total)
    const defaultResponse = tinkResponse || {
      expenses: {
        housing: {
          summaries: {
            summariesByMonth: {
              lastSixMonths: { mean: { unscaledValue: '-80000', scale: '2' } },
            },
          },
        },
        groceries: {
          summaries: {
            summariesByMonth: {
              lastSixMonths: { mean: { unscaledValue: '-40000', scale: '2' } },
            },
          },
        },
        utilities: {
          summaries: {
            summariesByMonth: {
              lastSixMonths: { mean: { unscaledValue: '-20000', scale: '2' } },
            },
          },
        },
        transportation: {
          summaries: {
            summariesByMonth: {
              lastSixMonths: { mean: { unscaledValue: '-20000', scale: '2' } },
            },
          },
        },
        other: {
          summaries: {
            summariesByMonth: {
              lastSixMonths: { mean: { unscaledValue: '-50000', scale: '2' } },
            },
          },
        },
      },
    };

    try {
      if (!defaultResponse?.expenses || typeof defaultResponse.expenses !== 'object') {
        return Result.fail(new Error('Invalid expenses data structure'));
      }

      const breakdown: ExpenseBreakdown = {
        housing: 0,
        food: 0,
        utilities: 0,
        transport: 0,
        other: 0,
        total: 0,
      };

      const expensesObj = defaultResponse.expenses;

      // Map Tink categories to hardship assessment buckets
      const categoryMapping: Record<string, keyof ExpenseBreakdown> = {
        housing: 'housing',
        groceries: 'food',
        utilities: 'utilities',
        transportation: 'transport',
        childRelated: 'other',
        collections: 'other',
        creditCards: 'other',
        healthcare: 'other',
        insurance: 'other',
        loans: 'other',
        other: 'other',
        savingsAndInvestments: 'other',
        subscriptionsAndIt: 'other',
        taxes: 'other',
        transfers: 'other',
      };

      for (const [categoryKey, category] of Object.entries(expensesObj)) {
        const mean = (category as any)?.summaries?.summariesByMonth?.lastSixMonths?.mean;

        if (!mean || !mean.unscaledValue || !mean.scale) {
          continue;
        }

        const amount = Math.abs(this.decodeScaledValue(mean.unscaledValue, mean.scale));
        const bucketKey = categoryMapping[categoryKey] || 'other';

        breakdown[bucketKey] += amount;
      }

      breakdown.total =
        breakdown.housing +
        breakdown.food +
        breakdown.utilities +
        breakdown.transport +
        breakdown.other;
      breakdown.total = Math.round(breakdown.total * 100) / 100;

      return Result.ok(breakdown);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error extracting expenses';
      return Result.fail(new Error(message));
    }
  }
}
