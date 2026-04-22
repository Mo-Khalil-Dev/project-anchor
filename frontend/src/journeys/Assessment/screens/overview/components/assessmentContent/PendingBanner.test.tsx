import { render, screen } from '@testing-library/react';
import { PendingBanner } from './PendingBanner';

describe('PendingBanner', () => {
  it('renders the pending message', () => {
    render(<PendingBanner />);
    expect(screen.getByText(/Your assessment is still calculating/)).toBeInTheDocument();
  });

  it('renders the analysing detail', () => {
    render(<PendingBanner />);
    expect(screen.getByText(/analysing your financial situation/)).toBeInTheDocument();
  });
});
