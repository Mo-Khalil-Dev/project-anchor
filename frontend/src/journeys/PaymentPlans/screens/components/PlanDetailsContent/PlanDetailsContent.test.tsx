import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanDetailsContent } from './PlanDetailsContent';
import type { PaymentPlanDTO, AssessmentDetailedDTO } from '../../../types';

describe('PlanDetailsContent', () => {
  const mockPlan: PaymentPlanDTO = {
    type: 'Conservative',
    monthlyAmount: 150,
    durationMonths: 24,
    totalPayable: 3600,
    sustainability: 'HIGH',
    riskFactors: [],
  };

  const mockAssessment: AssessmentDetailedDTO = {
    id: '1',
    userId: 'user1',
    customerId: 'cust1',
    hardshipLevel: 'MODERATE',
    disposableIncome: 200,
    paymentPlans: [mockPlan],
    arrears: 3600,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders monthly payment card', () => {
    render(
      <PlanDetailsContent
        plan={mockPlan}
        assessment={mockAssessment}
        buffer={50}
        color="conservative"
      />
    );

    expect(screen.getByText(/£150/)).toBeInTheDocument();
  });

  it('renders key numbers card', () => {
    render(
      <PlanDetailsContent
        plan={mockPlan}
        assessment={mockAssessment}
        buffer={50}
        color="conservative"
      />
    );

    expect(screen.getByText(/24/)).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    const { container } = render(
      <PlanDetailsContent
        plan={mockPlan}
        assessment={mockAssessment}
        buffer={50}
        color="balanced"
      />
    );

    expect(container.querySelector('[class*="balanced"]')).toBeInTheDocument();
  });
});
