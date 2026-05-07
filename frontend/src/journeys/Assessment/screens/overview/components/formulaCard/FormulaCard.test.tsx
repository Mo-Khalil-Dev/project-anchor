import { render, screen } from '@testing-library/react';
import { FormulaCard } from '.';

describe('FormulaCard', () => {
  const defaultProps = { monthlyIncome: 3000, monthlyExpenses: 1800, disposableIncome: 1200 };

  it('renders the section heading', () => {
    render(<FormulaCard {...defaultProps} />);
    expect(screen.getByText('How we calculated this')).toBeInTheDocument();
  });

  it('renders all three formula items', () => {
    render(<FormulaCard {...defaultProps} />);
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Essentials')).toBeInTheDocument();
    expect(screen.getByText('Disposable')).toBeInTheDocument();
  });

  it('renders the minus and equals operators', () => {
    render(<FormulaCard {...defaultProps} />);
    expect(screen.getByText('−')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
  });
});
