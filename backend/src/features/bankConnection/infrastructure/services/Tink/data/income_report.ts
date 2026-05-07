// Tink Financial Insights API mock — UK customer profile
// Sarah Thompson, 32, part-time care worker, single parent (1 child)
// Income: £2,257/month | Expenses: £1,722/month | Disposable: £535/month
// Utility bill ratio: ~31% → SEVERE hardship

const scaled = (pounds: number): { unscaledValue: string; scale: string } => ({
  unscaledValue: String(Math.round(pounds * 100)),
  scale: '2',
});

export const MOCK_TINK_INCOME_REPORT = {
  id: 'a3f8c1d2e4b5a6c7d8e9f0a1b2c3d4e5',
  income: {
    streams: [
      {
        id: 'stream-salary-001',
        type: 'SALARY',
        title: 'MERIDIAN CARE SERVICES LTD',
        stable: true,
        confidence: 'HIGH',
        summaryByMonths: {
          lastThreeMonths: {
            mean: scaled(1775),
            count: 3,
            values: [scaled(1750), scaled(1795), scaled(1780)],
          },
          lastSixMonths: {
            mean: scaled(1750),
            count: 6,
            values: [scaled(1750), scaled(1795), scaled(1780), scaled(1750), scaled(1680), scaled(1745)],
          },
          lastTwelveMonths: {
            mean: scaled(1728),
            count: 12,
          },
        },
      },
      {
        id: 'stream-benefits-001',
        type: 'BENEFITS',
        title: 'DWP UNIVERSAL CREDIT',
        stable: true,
        confidence: 'HIGH',
        summaryByMonths: {
          lastThreeMonths: {
            mean: scaled(420),
            count: 3,
            values: [scaled(420), scaled(420), scaled(420)],
          },
          lastSixMonths: {
            mean: scaled(420),
            count: 6,
            values: [scaled(420), scaled(420), scaled(420), scaled(420), scaled(395), scaled(420)],
          },
          lastTwelveMonths: {
            mean: scaled(413),
            count: 12,
          },
        },
      },
      {
        id: 'stream-benefits-002',
        type: 'BENEFITS',
        title: 'DWP CHILD BENEFIT',
        stable: true,
        confidence: 'HIGH',
        summaryByMonths: {
          lastThreeMonths: {
            mean: scaled(87.20),
            count: 3,
            values: [scaled(87.20), scaled(87.20), scaled(87.20)],
          },
          lastSixMonths: {
            mean: scaled(87.20),
            count: 6,
            values: [scaled(87.20), scaled(87.20), scaled(87.20), scaled(87.20), scaled(87.20), scaled(87.20)],
          },
          lastTwelveMonths: {
            mean: scaled(87.20),
            count: 12,
          },
        },
      },
    ],
  },
};

export const MOCK_TINK_EXPENSE_REPORT = {
  id: 'b4e9d2f1c3a7b8e6d5c4a3b2e1f0d9c8',
  expenses: {
    housing: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-855) },
          lastSixMonths: { mean: scaled(-850) },
          lastTwelveMonths: { mean: scaled(-832) },
        },
      },
    },
    groceries: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-298) },
          lastSixMonths: { mean: scaled(-280) },
          lastTwelveMonths: { mean: scaled(-265) },
        },
      },
    },
    utilities: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-172) },
          lastSixMonths: { mean: scaled(-165) },
          lastTwelveMonths: { mean: scaled(-154) },
        },
      },
    },
    transportation: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-90) },
          lastSixMonths: { mean: scaled(-85) },
          lastTwelveMonths: { mean: scaled(-81) },
        },
      },
    },
    childRelated: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-145) },
          lastSixMonths: { mean: scaled(-140) },
          lastTwelveMonths: { mean: scaled(-133) },
        },
      },
    },
    insurance: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-52) },
          lastSixMonths: { mean: scaled(-52) },
          lastTwelveMonths: { mean: scaled(-48) },
        },
      },
    },
    healthcare: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-38) },
          lastSixMonths: { mean: scaled(-32) },
          lastTwelveMonths: { mean: scaled(-27) },
        },
      },
    },
    subscriptionsAndIt: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-28) },
          lastSixMonths: { mean: scaled(-26) },
          lastTwelveMonths: { mean: scaled(-23) },
        },
      },
    },
    other: {
      summaries: {
        summariesByMonth: {
          lastThreeMonths: { mean: scaled(-98) },
          lastSixMonths: { mean: scaled(-92) },
          lastTwelveMonths: { mean: scaled(-85) },
        },
      },
    },
  },
};

export const MOCK_TINK_RESPONSE = {
  ...MOCK_TINK_INCOME_REPORT,
  ...MOCK_TINK_EXPENSE_REPORT,
};
