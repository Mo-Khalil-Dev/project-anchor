import { act, render, screen } from '@testing-library/react';
import { CheckingState } from './CheckingState';

describe('CheckingState', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders the checking copy', () => {
    render(<CheckingState onAdvance={vi.fn()} delayMs={1000} />);
    expect(screen.getByText('Checking your account…')).toBeInTheDocument();
    expect(screen.getByText('Looking up linked utility accounts')).toBeInTheDocument();
  });

  it('calls onAdvance after the configured delay', () => {
    const onAdvance = vi.fn();
    render(<CheckingState onAdvance={onAdvance} delayMs={1000} />);
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });
});
