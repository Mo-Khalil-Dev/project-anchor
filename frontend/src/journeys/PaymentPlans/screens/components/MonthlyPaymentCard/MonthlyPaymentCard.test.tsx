import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthlyPaymentCard } from './MonthlyPaymentCard';

describe('MonthlyPaymentCard', () => {
  it('renders monthly amount', () => {
    render(
      <MonthlyPaymentCard
        monthlyAmount={150}
        sustainability="HIGH"
        color="conservative"
      />
    );

    expect(screen.getByText('£150')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('applies correct color class based on prop', () => {
    const { container } = render(
      <MonthlyPaymentCard
        monthlyAmount={200}
        sustainability="MEDIUM"
        color="balanced"
      />
    );

    const element = container.querySelector('[class*="balanced"]');
    expect(element).toBeInTheDocument();
  });

  it('displays sustainability badge', () => {
    render(
      <MonthlyPaymentCard
        monthlyAmount={100}
        sustainability="LOW"
        color="aggressive"
      />
    );

    expect(screen.getByText('LOW')).toBeInTheDocument();
  });
});
