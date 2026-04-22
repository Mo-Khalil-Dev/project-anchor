import { render, screen } from '@testing-library/react';
import { BillExplanation } from './BillExplanation';

describe('BillExplanation', () => {
  it('renders the rounded percentage in context', () => {
    render(<BillExplanation rounded={38} hardshipLevel="SEVERE" />);
    expect(screen.getByText(/38% of your monthly disposable income/)).toBeInTheDocument();
  });

  it('renders the hardship level in lowercase', () => {
    render(<BillExplanation rounded={38} hardshipLevel="MODERATE" />);
    expect(screen.getByText(/moderate financial hardship/)).toBeInTheDocument();
  });

  it('renders the Ofgem guidelines reference', () => {
    render(<BillExplanation rounded={38} hardshipLevel="LOW" />);
    expect(screen.getByText(/Ofgem guidelines/)).toBeInTheDocument();
  });
});
