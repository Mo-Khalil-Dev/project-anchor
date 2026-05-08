import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanDetailsContent } from '.';
import {AssessmentDetailedDTO, PaymentPlanDTO} from "../../../../../types";


describe('PlanDetailsContent', () => {
  const mockPlan: PaymentPlanDTO = {
    type: 'Conservative',
    monthlyAmount: 150,
    duration: 24,
    totalRepayment: 3600,
    sustainability: 'HIGH',
  };

  const mockAssessment = {
    id: '1',
    customerId: 'cust1',
    hardshipLevel: 'MODERATE',
    disposableIncome: 200,
    paymentPlans: [mockPlan],
    arrears: 3600,
  } as unknown as AssessmentDetailedDTO;

  it('renders monthly payment card', () => {
    render(
      <PlanDetailsContent
        plan={mockPlan}
        assessment={mockAssessment}
        buffer={50}
        color="conservative"
      />
    );

    const amounts = screen.getAllByText('£150');
    expect(amounts.length).toBeGreaterThan(0);
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

    expect(screen.getByText(/24 months/)).toBeInTheDocument();
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
