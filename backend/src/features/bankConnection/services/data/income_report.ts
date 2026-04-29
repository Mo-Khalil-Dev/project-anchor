// Simplified Tink API response mock
export const MOCK_TINK_RESPONSE = {
  id: '19eb76febdef45308a65e7babe667740',
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
