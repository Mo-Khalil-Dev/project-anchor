import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenefitsCard } from './BenefitsCard';

describe('BenefitsCard', () => {
  const mockBenefits = [
    { text: 'Lowest monthly payment', type: 'benefit' as const },
    { text: 'May miss payments', type: 'risk' as const },
  ];

  it('renders all benefits', () => {
    render(<BenefitsCard items={mockBenefits} />);

    expect(screen.getByText('Lowest monthly payment')).toBeInTheDocument();
    expect(screen.getByText('May miss payments')).toBeInTheDocument();
  });

  it('shows checkmark for benefits', () => {
    render(
      <BenefitsCard
        items={[{ text: 'Good thing', type: 'benefit' }]}
      />
    );

    const checkmark = screen.getByRole('img', { hidden: true });
    expect(checkmark).toBeInTheDocument();
  });

  it('shows warning icon for risks', () => {
    render(
      <BenefitsCard
        items={[{ text: 'Bad thing', type: 'risk' }]}
      />
    );

    expect(screen.getByText('Bad thing')).toBeInTheDocument();
  });
});
