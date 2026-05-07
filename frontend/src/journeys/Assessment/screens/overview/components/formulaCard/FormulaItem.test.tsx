import { render, screen } from '@testing-library/react';
import { FormulaItem } from '.';

describe('FormulaItem', () => {
  it('renders the label', () => {
    render(<FormulaItem variant="green" label="Income" value={3000} />);
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  it('renders formatted value with £ prefix and /mo suffix', () => {
    render(<FormulaItem variant="green" label="Income" value={3000} />);
    expect(screen.getByText('£3,000/mo')).toBeInTheDocument();
  });

  it('applies the variant class', () => {
    const { container } = render(<FormulaItem variant="amber" label="Essentials" value={1800} />);
    expect(container.firstChild).toHaveClass('amber');
  });
});
