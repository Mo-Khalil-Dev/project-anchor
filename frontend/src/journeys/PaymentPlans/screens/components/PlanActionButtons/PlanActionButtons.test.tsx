import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanActionButtons } from '.';

describe('PlanActionButtons', () => {
  it('renders select and back buttons', () => {
    const mockSelect = vi.fn();
    const mockBack = vi.fn();

    render(
      <PlanActionButtons
        onSelect={mockSelect}
        onBack={mockBack}
        selectText="Select Plan"
      />
    );

    expect(screen.getByRole('button', { name: /select plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('calls onSelect when select button clicked', async () => {
    const user = userEvent.setup();
    const mockSelect = vi.fn();
    const mockBack = vi.fn();

    render(
      <PlanActionButtons
        onSelect={mockSelect}
        onBack={mockBack}
        selectText="Select"
      />
    );

    await user.click(screen.getByRole('button', { name: /select/i }));
    expect(mockSelect).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup();
    const mockSelect = vi.fn();
    const mockBack = vi.fn();

    render(
      <PlanActionButtons
        onSelect={mockSelect}
        onBack={mockBack}
        selectText="Select"
      />
    );

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(mockBack).toHaveBeenCalled();
  });
});
