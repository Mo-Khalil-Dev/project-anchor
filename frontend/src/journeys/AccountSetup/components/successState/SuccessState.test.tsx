import { fireEvent, render, screen } from '@testing-library/react';
import type { LinkDetails } from '../../types';
import { SuccessState } from './SuccessState';

const details: LinkDetails = { utilityType: 'water', postcode: 'SW1A 1AA', accountRef: '12345' };

describe('SuccessState', () => {
  it('shows the verified summary for the linked account', () => {
    render(<SuccessState details={details} onContinue={vi.fn()} />);
    expect(screen.getByText('Account linked!')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('SW1A 1AA')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('fires onContinue when the CTA is clicked', () => {
    const onContinue = vi.fn();
    render(<SuccessState details={details} onContinue={onContinue} />);
    fireEvent.click(screen.getByRole('button', { name: /Continue to bank connection/ }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
