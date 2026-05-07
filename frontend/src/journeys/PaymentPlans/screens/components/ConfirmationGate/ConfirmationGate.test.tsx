import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationGate } from '.';

describe('ConfirmationGate', () => {
  it('renders checkbox when not confirmed', () => {
    const mockSet = vi.fn();

    render(
      <ConfirmationGate
        confirmed={false}
        setConfirmed={mockSet}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('calls setConfirmed when checkbox toggled', async () => {
    const user = userEvent.setup();
    const mockSet = vi.fn();

    render(
      <ConfirmationGate
        confirmed={false}
        setConfirmed={mockSet}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(mockSet).toHaveBeenCalledWith(true);
  });

  it('shows confirmation banner when confirmed', () => {
    const mockSet = vi.fn();

    render(
      <ConfirmationGate
        confirmed={true}
        setConfirmed={mockSet}
      />
    );

    expect(screen.getByText(/understood/i)).toBeInTheDocument();
  });

  it('disables further changes when confirmed', () => {
    const mockSet = vi.fn();

    render(
      <ConfirmationGate
        confirmed={true}
        setConfirmed={mockSet}
      />
    );

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
