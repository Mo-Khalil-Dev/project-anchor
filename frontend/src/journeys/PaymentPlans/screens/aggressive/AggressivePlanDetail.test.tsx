import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AggressivePlanDetail } from './AggressivePlanDetail';
import type { AssessmentDetailedDTO } from '@/types';

vi.mock('./useAggressivePlanDetail', () => ({
  useAggressivePlanDetail: () => ({
    confirmed: false,
    setConfirmed: vi.fn(),
    handleSelectPlan: vi.fn(),
    handleSwitchToConservative: vi.fn(),
  }),
}));

vi.mock('@/components/layouts/CustomerLayout', () => ({
  CustomerLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../components', () => ({
  PlanDetailHeader: () => <div data-testid="plan-detail-header">Header</div>,
  PlanDetailsContent: () => <div data-testid="plan-details-content">Content</div>,
  WarningBanner: () => <div data-testid="warning-banner">Warning</div>,
  ConfirmationGate: () => <div data-testid="confirmation-gate">Gate</div>,
}));

vi.mock('@/components/core', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('AggressivePlanDetail', () => {
  const mockAssessment: AssessmentDetailedDTO = {
    id: '1',
    userId: 'user1',
    customerId: 'cust1',
    hardshipLevel: 'SEVERE',
    disposableIncome: 130,
    paymentPlans: [
      {
        type: 'Aggressive',
        monthlyAmount: 140,
        durationMonths: 12,
        totalPayable: 1680,
        sustainability: 'LOW',
        riskFactors: ['Exceeds disposable income', 'High risk of missed payments'],
      },
    ],
    arrears: 1680,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders warning banner for aggressive plan', () => {
    render(<AggressivePlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('warning-banner')).toBeInTheDocument();
  });

  it('renders confirmation gate', () => {
    render(<AggressivePlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('confirmation-gate')).toBeInTheDocument();
  });

  it('renders select aggressive plan button', () => {
    render(<AggressivePlanDetail assessment={mockAssessment} />);

    expect(screen.getByRole('button', { name: /select aggressive plan/i })).toBeInTheDocument();
  });

  it('renders switch to conservative button', () => {
    render(<AggressivePlanDetail assessment={mockAssessment} />);

    expect(screen.getByRole('button', { name: /switch to conservative/i })).toBeInTheDocument();
  });

  it('finds aggressive plan from assessment', () => {
    const assessment = {
      ...mockAssessment,
      paymentPlans: [
        {
          type: 'Conservative',
          monthlyAmount: 100,
          durationMonths: 36,
          totalPayable: 3600,
          sustainability: 'HIGH',
          riskFactors: [],
        },
        {
          type: 'Aggressive',
          monthlyAmount: 200,
          durationMonths: 12,
          totalPayable: 2400,
          sustainability: 'LOW',
          riskFactors: [],
        },
      ],
    };

    render(<AggressivePlanDetail assessment={assessment} />);

    expect(screen.getByTestId('plan-details-content')).toBeInTheDocument();
  });
});
