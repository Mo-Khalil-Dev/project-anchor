import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders formatted value with £ prefix', () => {
    render(<StatCard variant="green" value={3000} label="Monthly Income" sub="Average over 6 months" />);
    expect(screen.getByText('£3,000')).toBeInTheDocument();
  });

  it('renders label and sub text', () => {
    render(<StatCard variant="amber" value={1800} label="Total Expenses" sub="Essential spending" />);
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Essential spending')).toBeInTheDocument();
  });

  it('applies the variant class to the card', () => {
    const { container } = render(<StatCard variant="red" value={100} label="L" sub="S" />);
    expect(container.firstChild).toHaveClass('red');
  });
});
