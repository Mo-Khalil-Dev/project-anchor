import { fireEvent, render, screen } from '@testing-library/react';
import type { LinkDetails } from '../../types';
import { ErrorState } from '.';

const details: LinkDetails = { utilityType: 'gas', postcode: 'SW1A 1AA', accountRef: 'ERR99' };

describe('ErrorState', () => {
  it('shows the rejection title and entered details', () => {
    render(<ErrorState details={details} onRetry={vi.fn()} onHelp={vi.fn()} />);
    expect(screen.getByText("Couldn't verify account")).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('SW1A 1AA')).toBeInTheDocument();
    expect(screen.getByText('ERR99')).toBeInTheDocument();
  });

  it('lists the common rejection reasons', () => {
    render(<ErrorState details={details} onRetry={vi.fn()} onHelp={vi.fn()} />);
    expect(screen.getByLabelText('Common reasons this happens')).toBeInTheDocument();
    expect(screen.getByText(/Postcode doesn't match/)).toBeInTheDocument();
  });

  it('fires onRetry and onHelp from the action buttons', () => {
    const onRetry = vi.fn();
    const onHelp = vi.fn();
    render(<ErrorState details={details} onRetry={onRetry} onHelp={onHelp} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    fireEvent.click(screen.getByRole('button', { name: /I need help finding my details/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onHelp).toHaveBeenCalledTimes(1);
  });
});
