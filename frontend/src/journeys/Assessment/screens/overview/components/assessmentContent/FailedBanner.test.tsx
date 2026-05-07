import { render, screen } from '@testing-library/react';
import { FailedBanner } from '.';

describe('FailedBanner', () => {
  it('renders the failed message', () => {
    render(<FailedBanner />);
    expect(screen.getByText(/Assessment calculation failed/)).toBeInTheDocument();
  });

  it('renders the support instruction', () => {
    render(<FailedBanner />);
    expect(screen.getByText(/contact support/)).toBeInTheDocument();
  });
});
