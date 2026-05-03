import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentTimeline } from './PaymentTimeline';

describe('PaymentTimeline', () => {
  const mockPayments = [
    { month: 1, amount: 150, date: 'Jun 2026' },
    { month: 2, amount: 150, date: 'Jul 2026' },
    { month: 3, amount: 150, date: 'Aug 2026' },
  ];

  it('renders payment months', () => {
    render(<PaymentTimeline payments={mockPayments} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays payment amounts', () => {
    render(<PaymentTimeline payments={mockPayments} />);

    expect(screen.getByText('£150')).toBeInTheDocument();
  });

  it('shows all payment dates', () => {
    render(<PaymentTimeline payments={mockPayments} />);

    expect(screen.getByText('Jun 2026')).toBeInTheDocument();
    expect(screen.getByText('Jul 2026')).toBeInTheDocument();
    expect(screen.getByText('Aug 2026')).toBeInTheDocument();
  });
});
