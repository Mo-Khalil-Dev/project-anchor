import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PaymentPlanDTO } from '@/types';
import { MonthlyPaymentCard } from '.';

const makePlan = (overrides: Partial<PaymentPlanDTO> = {}): PaymentPlanDTO => ({
  type: 'Conservative',
  monthlyAmount: 150,
  duration: 24,
  totalRepayment: 3600,
  sustainability: 'HIGH',
  ...overrides,
});

describe('MonthlyPaymentCard', () => {
  it('renders monthly amount', () => {
    render(<MonthlyPaymentCard plan={makePlan({ monthlyAmount: 150 })} color="conservative" />);

    expect(screen.getByText('£150')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('applies correct color class based on prop', () => {
    const { container } = render(
      <MonthlyPaymentCard plan={makePlan({ monthlyAmount: 200, sustainability: 'MEDIUM' })} color="balanced" />
    );

    const element = container.querySelector('[class*="balanced"]');
    expect(element).toBeInTheDocument();
  });

  it('displays sustainability badge', () => {
    render(<MonthlyPaymentCard plan={makePlan({ monthlyAmount: 100, sustainability: 'LOW' })} color="aggressive" />);

    expect(screen.getByText(/LOW sustainability/)).toBeInTheDocument();
  });
});
