import { render, screen } from '@testing-library/react';
import { AssessmentPendingView } from './AssessmentPendingView';

vi.mock('./PendingProgressStep', () => ({
  PendingProgressStep: ({ step }: { step: { label: string } }) => <div>step:{step.label}</div>,
}));

describe('AssessmentPendingView', () => {
  it('renders the title and subtitle', () => {
    render(<AssessmentPendingView />);
    expect(screen.getByText(/We're analyzing your finances/)).toBeInTheDocument();
    expect(screen.getByText(/usually takes about 30 seconds/)).toBeInTheDocument();
  });

  it('renders all three progress steps', () => {
    render(<AssessmentPendingView />);
    expect(screen.getByText('step:Bank connection established')).toBeInTheDocument();
    expect(screen.getByText('step:Analyzing 6 months of transactions')).toBeInTheDocument();
    expect(screen.getByText('step:Calculating your affordability')).toBeInTheDocument();
  });

  it('renders the reassurance note', () => {
    render(<AssessmentPendingView />);
    expect(screen.getByText(/leave this page and come back/)).toBeInTheDocument();
  });
});
