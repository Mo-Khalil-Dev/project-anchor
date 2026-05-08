import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenefitsCard } from '.';

describe('BenefitsCard', () => {
  it('renders all benefits', () => {
    render(
      <BenefitsCard
        title="Pros & Cons"
        items={[
          { text: 'Lowest monthly payment', ok: true },
          { text: 'May miss payments', ok: false },
        ]}
      />
    );

    expect(screen.getByText('Lowest monthly payment')).toBeInTheDocument();
    expect(screen.getByText('May miss payments')).toBeInTheDocument();
  });

  it('shows checkmark for benefits', () => {
    render(<BenefitsCard title="Pros" items={[{ text: 'Good thing', ok: true }]} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows warning icon for risks', () => {
    render(<BenefitsCard title="Cons" items={[{ text: 'Bad thing', ok: false }]} />);

    expect(screen.getByText('Bad thing')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
  });
});
