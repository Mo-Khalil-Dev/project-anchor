import { Assessment } from '@/journeys/Assessment/models/assessment';

export function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 'assessment-1',
    customerId: 'customer-1',
    monthlyIncome: 3000,
    monthlyExpenses: 1800,
    disposableIncome: 1200,
    monthlyBill: 450,
    billRatio: 37.5,
    hardshipLevel: 'SEVERE',
    status: 'COMPLETED',
    calculatedAt: '2026-01-15T10:30:00Z',
    arrears: null,
    incomeBreakdown: null,
    expenseBreakdown: null,
    ...overrides,
  };
}
