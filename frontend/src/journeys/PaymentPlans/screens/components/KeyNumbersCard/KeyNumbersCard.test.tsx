import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyNumbersCard } from './KeyNumbersCard';

describe('KeyNumbersCard', () => {
  it('renders all four key numbers', () => {
    render(
      <KeyNumbersCard
        duration={24}
        totalPaid={3600}
        monthlyBuffer={30}
        disposableRemaining={130}
      />
    );

    expect(screen.getByText(/24/)).toBeInTheDocument();
    expect(screen.getByText(/£3,600/)).toBeInTheDocument();
    expect(screen.getByText(/£30/)).toBeInTheDocument();
    expect(screen.getByText(/£130/)).toBeInTheDocument();
  });

  it('displays correct labels', () => {
    render(
      <KeyNumbersCard
        duration={12}
        totalPaid={1800}
        monthlyBuffer={50}
        disposableRemaining={150}
      />
    );

    expect(screen.getByText(/months/i)).toBeInTheDocument();
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <KeyNumbersCard
        duration={36}
        totalPaid={5400}
        monthlyBuffer={100}
        disposableRemaining={200}
      />
    );

    expect(screen.getByText('£5,400')).toBeInTheDocument();
  });
});
