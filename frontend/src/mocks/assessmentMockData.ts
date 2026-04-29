/**
 * Mock Assessment Data
 *
 * Realistic assessment breakdown data for development and testing.
 * Uses real UK household averages (ONS, FCA data).
 *
 * Used by: Assessment Breakdown UI (4 tabs) + Payment Plan Options
 * Swapped for real data via service when backend API is ready.
 */

import type { AssessmentDetailedDTO } from '../types';

export const MOCK_ASSESSMENT_DETAILED: AssessmentDetailedDTO = {
  id: 'assess_mock_001',
  customerId: 'cust_mock_001',
  hardshipLevel: 'MODERATE',
  disposableIncome: 2100,
  billRatio: 15.24, // £320 / £2,100 × 100
  monthlyBill: 320,
  monthlyIncome: 4200,
  monthlyExpenses: 2100,
  arrears: 3000,

  // Expense breakdown (realistic UK household)
  expensesByCategory: {
    Housing: 1200,
    Utilities: 320,
    Food: 300,
    Transport: 150,
    Other: 130,
  },

  // 6-month income history (with natural variation)
  incomeHistory: [
    { month: 'Oct 2025', amount: 1950 },
    { month: 'Nov 2025', amount: 2100 },
    { month: 'Dec 2025', amount: 1800 },
    { month: 'Jan 2026', amount: 2050 },
    { month: 'Feb 2026', amount: 2200 },
    { month: 'Mar 2026', amount: 2100 },
  ],

  // Income sources (employment + benefits)
  incomeSources: [
    { type: 'Employment', amount: 1950, frequency: 'Monthly' },
    { type: 'Benefits', amount: 150, frequency: 'Monthly' },
  ],

  // Assessment factors (why they're in hardship)
  factors: [
    {
      title: 'Household size: 4 dependents',
      description: 'Four dependents increases essential expenses for food, transport, and childcare.',
    },
    {
      title: 'Recent illness (3 months)',
      description: 'Medical costs and reduced work hours during recovery have impacted disposable income.',
    },
    {
      title: 'Utility bill 18% above postcode average',
      description: 'Your utility bills are higher than similar properties in M1 postcode area.',
    },
  ],

  // Payment plans (Conservative 14%, Balanced 18%, Aggressive 20% of disposable income)
  paymentPlans: [
    {
      type: 'Conservative',
      monthlyAmount: 294, // £2,100 × 0.14
      duration: 11, // ceil(3,000 / 294)
      totalRepayment: 3000,
      sustainability: 'HIGH',
    },
    {
      type: 'Balanced',
      monthlyAmount: 378, // £2,100 × 0.18
      duration: 8, // ceil(3,000 / 378)
      totalRepayment: 3000,
      sustainability: 'MEDIUM',
    },
    {
      type: 'Aggressive',
      monthlyAmount: 420, // £2,100 × 0.20
      duration: 8, // ceil(3,000 / 420)
      totalRepayment: 3000,
      sustainability: 'MEDIUM',
    },
  ],

  // Metadata
  createdAt: new Date('2026-03-25').toISOString(),
  updatedAt: new Date('2026-03-29').toISOString(),
  status: 'COMPLETED',
};

/**
 * UK expense averages (ONS, 2025)
 * Used for comparisons in OverviewTab
 */
export const UK_EXPENSE_AVERAGES = {
  Housing: 1050,
  Utilities: 230,
  Food: 320,
  Transport: 200,
  Other: 300,
};

/**
 * Hardship level colors (for badges)
 */
export const HARDSHIP_COLORS = {
  SEVERE: '#dc2626', // red-600
  MODERATE: '#ea580c', // orange-600
  LOW: '#eab308', // yellow-500
  NONE: '#22c55e', // green-500
};
