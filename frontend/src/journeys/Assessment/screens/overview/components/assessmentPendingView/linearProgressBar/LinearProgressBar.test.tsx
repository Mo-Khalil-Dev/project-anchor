import { render, screen } from '@testing-library/react';
import { LinearProgressBar } from '.';

describe('LinearProgressBar', () => {
  it('renders fill width matching the progress value', () => {
    render(<LinearProgressBar progress={42} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle('width: 42%');
  });

  it('clamps progress below 0 to 0%', () => {
    render(<LinearProgressBar progress={-5} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle('width: 0%');
  });

  it('clamps progress above 100 to 100%', () => {
    render(<LinearProgressBar progress={150} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle('width: 100%');
  });

  it('exposes the rounded value via aria-valuenow', () => {
    render(<LinearProgressBar progress={73.4} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '73');
  });
});
