import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarningBanner } from './WarningBanner';

describe('WarningBanner', () => {
  it('renders warning title', () => {
    render(
      <WarningBanner
        title="High risk warning"
        text="This plan is risky"
      />
    );

    expect(screen.getByText('High risk warning')).toBeInTheDocument();
  });

  it('renders warning text', () => {
    render(
      <WarningBanner
        title="Warning"
        text="Detailed warning message here"
      />
    );

    expect(screen.getByText('Detailed warning message here')).toBeInTheDocument();
  });

  it('displays warning icon', () => {
    const { container } = render(
      <WarningBanner
        title="Be careful"
        text="This requires attention"
      />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
