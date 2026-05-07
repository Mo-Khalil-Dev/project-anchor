import { render, screen } from '@testing-library/react';
import { WhatHappensNextCard } from '.';

describe('WhatHappensNextCard', () => {
  it('renders the section label', () => {
    render(<WhatHappensNextCard />);
    expect(screen.getByText('What happens next')).toBeInTheDocument();
  });

  it('renders all three numbered steps with their titles', () => {
    render(<WhatHappensNextCard />);
    expect(screen.getByText('Assessment ready')).toBeInTheDocument();
    expect(screen.getByText('View your results')).toBeInTheDocument();
    expect(screen.getByText('Choose your plan')).toBeInTheDocument();
  });

  it('renders the descriptions for each step', () => {
    render(<WhatHappensNextCard />);
    expect(screen.getByText(/finalise your hardship score/)).toBeInTheDocument();
    expect(screen.getByText(/full breakdown of your income/)).toBeInTheDocument();
    expect(screen.getByText(/from as low as £35\/month/)).toBeInTheDocument();
  });

  it('renders three list items', () => {
    render(<WhatHappensNextCard />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
