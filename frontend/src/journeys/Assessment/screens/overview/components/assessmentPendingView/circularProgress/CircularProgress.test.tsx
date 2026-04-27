import { render, screen } from '@testing-library/react';
import { CircularProgress } from './CircularProgress';

describe('CircularProgress', () => {
  it('renders the progress percentage', () => {
    render(<CircularProgress progress={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('rounds non-integer progress', () => {
    render(<CircularProgress progress={37.6} />);
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('clamps progress below 0 and above 100', () => {
    const { rerender } = render(<CircularProgress progress={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    rerender(<CircularProgress progress={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('exposes accessible progressbar role with the current value', () => {
    render(<CircularProgress progress={73} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '73');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});
