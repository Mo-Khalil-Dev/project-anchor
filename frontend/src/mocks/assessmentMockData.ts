/**
 * Mock Assessment Data
 *
 * Matches the high-fidelity wireframes in:
 * docs/wireframes/design_handoff_bridge/screens/Screen 2.1.2-5 - Assessment Breakdown.html
 * docs/wireframes/design_handoff_bridge/screens/Screen 2.2.1 - Payment Plans.html
 */

import type { AssessmentDetailedDTO } from '@/types';

export const MOCK_ASSESSMENT_DETAILED: AssessmentDetailedDTO = {
  id: 'assess_mock_001',
  customerId: 'cust_mock_001',
  hardshipLevel: 'SEVERE',
  disposableIncome: 130,
  billRatio: 323,
  monthlyBill: 420,
  monthlyIncome: 1850,
  monthlyExpenses: 1720,
  arrears: 420,

  expensesByCategory: {
    Housing: 850,
    'Food & groceries': 320,
    Transport: 220,
    Utilities: 180,
    Other: 150,
  },

  incomeHistory: [
    { month: 'Nov', amount: 2100 },
    { month: 'Dec', amount: 1850 },
    { month: 'Jan', amount: 1750 },
    { month: 'Feb', amount: 1900 },
    { month: 'Mar', amount: 1800 },
    { month: 'Apr', amount: 1850 },
  ],

  incomeSources: [
    { type: 'Salary (regular)', amount: 1600, frequency: 'Monthly' },
    { type: 'Universal Credit', amount: 250, frequency: 'Monthly' },
  ],

  factors: [
    {
      title: 'High housing costs',
      description: 'Your rent of £850/mo is £130 above the regional average for a similar property. This is the primary driver of your tight disposable income.',
    },
    {
      title: 'Low disposable income',
      description: 'After essential spending, only £130/month remains. This means even a small unexpected expense (car, medical) pushes you into deficit.',
    },
    {
      title: 'Arrears accumulating interest',
      description: 'The £420 outstanding balance has been accruing. Each month without a plan adds further pressure to an already strained budget.',
    },
  ],

  paymentPlans: [
    {
      type: 'Conservative',
      monthlyAmount: 35,
      duration: 12,
      totalRepayment: 420,
      sustainability: 'HIGH',
    },
    {
      type: 'Balanced',
      monthlyAmount: 70,
      duration: 6,
      totalRepayment: 420,
      sustainability: 'MEDIUM',
    },
    {
      type: 'Aggressive',
      monthlyAmount: 140,
      duration: 3,
      totalRepayment: 420,
      sustainability: 'LOW',
    },
  ],

  createdAt: new Date('2026-04-15').toISOString(),
  updatedAt: new Date('2026-04-29').toISOString(),
  status: 'COMPLETED',
};

export const UK_EXPENSE_AVERAGES: Record<string, number> = {
  Housing: 720,
  'Food & groceries': 280,
  Transport: 160,
  Utilities: 140,
  Other: 120,
};

export const EXPENSE_COLORS: Record<string, string> = {
  Housing: 'oklch(52% 0.18 270)',
  'Food & groceries': 'oklch(62% 0.16 76)',
  Transport: 'oklch(52% 0.18 200)',
  Utilities: 'oklch(52% 0.18 145)',
  Other: '#9197ab',
};

export const FACTOR_SEVERITY: Record<string, { level: 'High' | 'Medium' | 'Low'; color: 'red' | 'amber' | 'green' }> = {
  'High housing costs': { level: 'High', color: 'red' },
  'Low disposable income': { level: 'Medium', color: 'amber' },
  'Arrears accumulating interest': { level: 'Medium', color: 'amber' },
};
