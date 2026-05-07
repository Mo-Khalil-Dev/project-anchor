import { render, screen } from '@testing-library/react';
import { SummaryCard } from '.';

describe('SummaryCard', () => {
  it('renders the title and every row', () => {
    render(
      <SummaryCard
        title="Account summary"
        rows={[
          { label: 'Utility type', value: 'Water' },
          { label: 'Postcode', value: 'SW1A 1AA' },
        ]}
      />
    );
    expect(screen.getByLabelText('Account summary')).toBeInTheDocument();
    expect(screen.getByText('Utility type')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Postcode')).toBeInTheDocument();
    expect(screen.getByText('SW1A 1AA')).toBeInTheDocument();
  });

  it('renders ReactNode values', () => {
    render(<SummaryCard title="X" rows={[{ label: 'Status', value: <span data-testid="badge">Verified</span> }]} />);
    expect(screen.getByTestId('badge')).toHaveTextContent('Verified');
  });
});
