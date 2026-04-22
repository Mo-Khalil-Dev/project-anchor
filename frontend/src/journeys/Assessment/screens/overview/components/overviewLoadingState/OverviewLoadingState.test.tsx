import { render, screen } from '@testing-library/react';
import { OverviewLoadingState } from './OverviewLoadingState';

describe('OverviewLoadingState', () => {
  it('renders the loading message', () => {
    render(<OverviewLoadingState />);
    expect(screen.getByText('Calculating your assessment...')).toBeInTheDocument();
  });

  it('renders a spinner element', () => {
    const { container } = render(<OverviewLoadingState />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });
});
