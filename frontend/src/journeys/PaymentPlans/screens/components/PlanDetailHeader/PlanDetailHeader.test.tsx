import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanDetailHeader } from '.';

describe('PlanDetailHeader', () => {
  it('renders title and subtitle', () => {
    render(
      <PlanDetailHeader
        title="Conservative Plan"
        subtitle="Our recommended option"
      />
    );

    expect(screen.getByText('Conservative Plan')).toBeInTheDocument();
    expect(screen.getByText('Our recommended option')).toBeInTheDocument();
  });

  it('renders title as heading', () => {
    render(
      <PlanDetailHeader
        title="Test Title"
        subtitle="Test Subtitle"
      />
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Test Title');
  });
});
