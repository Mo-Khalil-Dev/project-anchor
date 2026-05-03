import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConservativePlanDetail } from './ConservativePlanDetail';
import type { AssessmentDetailedDTO } from '@/types';

vi.mock('./useConservativePlanDetail', () => ({
  useConservativePlanDetail: () => ({
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

describe('ConservativePlanDetail', () => {
  const mockAssessment: AssessmentDetailedDTO = {
    id: '1',
    userId: 'user1',
    customerId: 'cust1',
    hardshipLevel: 'MODERATE',
    disposableIncome: 200,
    paymentPlans: [
      {
        type: 'Conservative',
        monthlyAmount: 150,
        durationMonths: 24,
        totalPayable: 3600,
        sustainability: 'HIGH',
        riskFactors: [],
      },
    ],
    arrears: 3600,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders plan detail header', () => {
    render(<ConservativePlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-detail-header')).toBeInTheDocument();
  });

  it('renders plan details content', () => {
    render(<ConservativePlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-details-content')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<ConservativePlanDetail assessment={mockAssessment} />);

    expect(screen.getByTestId('plan-action-buttons')).toBeInTheDocument();
  });

  it('finds conservative plan from assessment', () => {
    const assessment = {
      ...mockAssessment,
      paymentPlans: [
        {
          type: 'Aggressive',
          monthlyAmount: 200,
          durationMonths: 12,
          totalPayable: 2400,
          sustainability: 'LOW',
          riskFactors: [],
        },
        {
          type: 'Conservative',
          monthlyAmount: 100,
          durationMonths: 36,
          totalPayable: 3600,
          sustainability: 'HIGH',
          riskFactors: [],
        },
      ],
    };

    render(<ConservativePlanDetail assessment={assessment} />);

    expect(screen.getByTestId('plan-details-content')).toBeInTheDocument();
  });
});
