import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PaymentPlanDTO } from '@/types';
import { KeyNumbersCard } from '.';

const makePlan = (overrides: Partial<PaymentPlanDTO> = {}): PaymentPlanDTO => ({
  type: 'Conservative',
  monthlyAmount: 150,
  duration: 24,
  totalRepayment: 3600,
  sustainability: 'HIGH',
  ...overrides,
});

describe('KeyNumbersCard', () => {
  it('renders all four key numbers', () => {
    render(
      <KeyNumbersCard
        plan={makePlan({ duration: 24, totalRepayment: 3600 })}
        assessment={{ disposableIncome: 160 }}
        buffer={30}
      />
    );

    expect(screen.getByText(/24 months/)).toBeInTheDocument();
    expect(screen.getByText(/£3600/)).toBeInTheDocument();
    expect(screen.getAllByText(/£30/).length).toBeGreaterThan(0);
  });

  it('displays correct labels', () => {
    render(
      <KeyNumbersCard
        plan={makePlan({ duration: 12, totalRepayment: 1800 })}
        assessment={{ disposableIncome: 200 }}
        buffer={50}
      />
    );

    expect(screen.getByText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Total paid/i)).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <KeyNumbersCard
        plan={makePlan({ duration: 36, totalRepayment: 5400 })}
        assessment={{ disposableIncome: 300 }}
        buffer={100}
      />
    );

    expect(screen.getByText(/£5400/)).toBeInTheDocument();
  });
});
