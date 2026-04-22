import { render, screen } from '@testing-library/react';
import { BillRatioHeader } from './BillRatioHeader';

describe('BillRatioHeader', () => {
  it('renders the ratio percentage', () => {
    render(<BillRatioHeader rounded={38} monthlyBill={450} />);
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('renders the formatted monthly bill', () => {
    render(<BillRatioHeader rounded={38} monthlyBill={1500} />);
    expect(screen.getByText('£1,500')).toBeInTheDocument();
  });

  it('renders the label and balance label', () => {
    render(<BillRatioHeader rounded={38} monthlyBill={450} />);
    expect(screen.getByText('Bill as % of Disposable Income')).toBeInTheDocument();
    expect(screen.getByText('Your balance')).toBeInTheDocument();
  });
});
