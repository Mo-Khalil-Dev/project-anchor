import { render, screen } from '@testing-library/react';
import { StatCardsGrid } from './StatCardsGrid';

describe('StatCardsGrid', () => {
  const defaultProps = { monthlyIncome: 3000, monthlyExpenses: 1800, disposableIncome: 1200 };

  it('renders all three stat cards', () => {
    render(<StatCardsGrid {...defaultProps} />);
    expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Disposable Income')).toBeInTheDocument();
  });

  it('renders formatted currency values', () => {
    render(<StatCardsGrid {...defaultProps} />);
    expect(screen.getByText('£3,000')).toBeInTheDocument();
    expect(screen.getByText('£1,800')).toBeInTheDocument();
    expect(screen.getByText('£1,200')).toBeInTheDocument();
  });
});
