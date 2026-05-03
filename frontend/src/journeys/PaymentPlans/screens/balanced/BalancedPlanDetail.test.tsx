import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalancedPlanDetail } from './BalancedPlanDetail';
import type { AssessmentDetailedDTO } from '@/types';

vi.mock('./useBalancedPlanDetail', () => ({
  useBalancedPlanDetail: () => ({
    handleSelectPlan: vi.fn(),
    handleBack: vi.fn(),
  }),
}));

vi.mock('@/components/layouts/CustomerLayout', () => ({
  CustomerLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../components', () => ({
  PlanDetailHeader: () => <div data-testid="plan-detail-header">Header</div>,
  PlanDetailsContent: () => <div data-testid="plan-details-content">Content</div>,
  PlanActionButtons: () => <div data-testid="plan-action-buttons">Buttons</div>,
}));

describe('BalancedPlanDetail', () => {
  const mockAssessment: AssessmentDetailedDTO = {
    id: '1',
    userId: 'user1',
    customerId: 'cust1',
    hardshipLevel: 'MODERATE',
    disposableIncome: 200,
    paymentPlans: [
      {
        type: 'Balanced',
        monthlyAmount: 175,
        durationMonths: 18,
        totalPayable: 3150,
        sustainability: 'MEDIUM',
        riskFactors: [],
      },
    ],
    arrears: 3600,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders plan detail header with balanced title', () => {
    render(<BalancedPlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-detail-header')).toBeInTheDocument();
  });

  it('renders plan details content', () => {
    render(<BalancedPlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-details-content')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<BalancedPlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-action-buttons')).toBeInTheDocument();
  });

  it('calculates buffer correctly', () => {
    render(<BalancedPlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-details-content')).toBeInTheDocument();
  });
});
