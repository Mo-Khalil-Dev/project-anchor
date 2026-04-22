import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssessmentCTAs } from './AssessmentCTAs';

describe('AssessmentCTAs', () => {
  it('renders the Explore Payment Plans button', () => {
    render(<AssessmentCTAs onExplorePaymentPlans={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Explore Payment Plans' })).toBeInTheDocument();
  });

  it('renders the View Detailed Breakdown button', () => {
    render(<AssessmentCTAs onExplorePaymentPlans={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'View Detailed Breakdown' })).toBeInTheDocument();
  });

  it('calls onExplorePaymentPlans when primary button is clicked', async () => {
    const handler = vi.fn();
    render(<AssessmentCTAs onExplorePaymentPlans={handler} />);
    await userEvent.click(screen.getByRole('button', { name: 'Explore Payment Plans' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
