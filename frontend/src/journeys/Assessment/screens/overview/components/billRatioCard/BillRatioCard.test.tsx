import { render, screen } from '@testing-library/react';
import { BillRatioCard } from '.';

describe('BillRatioCard', () => {
  const defaultProps = { billRatio: 37.5, monthlyBill: 450, hardshipLevel: 'SEVERE' as const };

  it('rounds the bill ratio for display', () => {
    render(<BillRatioCard {...defaultProps} />);
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('renders the formatted monthly bill', () => {
    render(<BillRatioCard {...defaultProps} />);
    expect(screen.getByText('£450')).toBeInTheDocument();
  });

  it('renders the hardship level explanation', () => {
    render(<BillRatioCard {...defaultProps} />);
    expect(screen.getByText(/severe financial hardship/)).toBeInTheDocument();
  });

  it('renders benchmark and You marker', () => {
    render(<BillRatioCard {...defaultProps} />);
    expect(screen.getByText('Benchmark: 5–8%')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });
});
