import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentTimeline } from '.';

describe('PaymentTimeline', () => {
  it('renders payment months', () => {
    render(<PaymentTimeline monthlyAmount={150} duration={3} firstDate="Jun 2026" finalDate="Aug 2026" />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays payment amounts', () => {
    render(<PaymentTimeline monthlyAmount={150} duration={3} firstDate="Jun 2026" finalDate="Aug 2026" />);

    const amounts = screen.getAllByText('£150');
    expect(amounts.length).toBeGreaterThan(0);
  });

  it('shows first and final payment dates', () => {
    render(<PaymentTimeline monthlyAmount={150} duration={3} firstDate="Jun 2026" finalDate="Aug 2026" />);

    expect(screen.getByText(/Jun 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Aug 2026/)).toBeInTheDocument();
  });
});
