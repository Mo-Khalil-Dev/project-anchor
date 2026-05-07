import { rest } from 'msw';

export const tinkHandlers = [
  // OAuth token endpoint (v1)
  rest.post('https://api.tink.com/api/v1/oauth/token', async (req, res, ctx) => {
    const body = await req.text();
    const params = new URLSearchParams(body);

    if (params.get('grant_type') === 'client_credentials') {
      return res(
        ctx.json({
          access_token: 'mock_access_token_12345',
          expires_in: 3600,
          scope: 'expense-checks:readonly',
          token_type: 'Bearer',
        })
      );
    }

    return res(ctx.status(400), ctx.json({ error: 'Invalid grant_type' }));
  }),

  // OAuth token endpoint (without v1)
  rest.post('https://api.tink.com/oauth/token', async (req, res, ctx) => {
    const body = await req.text();
    const params = new URLSearchParams(body);

    if (params.get('grant_type') === 'client_credentials') {
      return res(
        ctx.json({
          access_token: 'mock_access_token_67890',
          expires_in: 3600,
          scope: 'expense-checks:readonly',
          token_type: 'Bearer',
        })
      );
    }

    return res(ctx.status(400), ctx.json({ error: 'Invalid grant_type' }));
  }),

  // Expense checks endpoint
  rest.get('https://api.tink.com/risk/v1/expense-checks/:customerId', (req, res, ctx) => {
    const { customerId } = req.params;
    return res(
      ctx.json({
        id: customerId,
        status: 'completed',
        expenseRatio: 0.45,
        summary: {
          totalIncome: 3000,
          totalExpenses: 1350,
          disposableIncome: 1650,
        },
      })
    );
  }),

  // Expense reports endpoint
  rest.get('https://api.tink.com/expense-reports/:reportId', (req, res, ctx) => {
    const { reportId } = req.params;
    return res(
      ctx.json({
        id: reportId,
        status: 'completed',
        generatedAt: new Date().toISOString(),
        data: {
          period: '2024-01-01 to 2024-03-31',
          totalExpenses: 1350,
          categories: [
            { name: 'Housing', amount: 500 },
            { name: 'Food', amount: 400 },
            { name: 'Transport', amount: 250 },
            { name: 'Utilities', amount: 200 },
          ],
        },
      })
    );
  }),

  // Risk insights endpoint
  rest.get('https://api.tink.com/risk-insights/:reportId', (req, res, ctx) => {
    const { reportId } = req.params;
    return res(
      ctx.json({
        id: reportId,
        riskScore: 0.35,
        riskLevel: 'LOW',
        insights: [
          { type: 'stable_income', message: 'Stable income pattern detected' },
          { type: 'low_expense_ratio', message: 'Expenses are manageable' },
        ],
      })
    );
  }),
];
