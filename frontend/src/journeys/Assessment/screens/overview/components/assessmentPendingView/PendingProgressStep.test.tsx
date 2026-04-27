import { render, screen } from '@testing-library/react';
import { PendingProgressStep } from './PendingProgressStep';
import type { PendingStep } from './useAssessmentPendingView';

const make = (overrides: Partial<PendingStep> = {}): PendingStep => ({
  label: 'A step',
  status: 'pending',
  statusText: 'Queued',
  ...overrides,
});

describe('PendingProgressStep', () => {
  it('renders the label and status text', () => {
    render(<PendingProgressStep step={make({ label: 'My step', statusText: 'In progress…' })} />);
    expect(screen.getByText('My step')).toBeInTheDocument();
    expect(screen.getByText('In progress…')).toBeInTheDocument();
  });

  it('shows the done indicator when status is done', () => {
    render(<PendingProgressStep step={make({ status: 'done' })} />);
    expect(screen.getByLabelText('Step complete')).toBeInTheDocument();
  });

  it('shows the active indicator when status is active', () => {
    render(<PendingProgressStep step={make({ status: 'active' })} />);
    expect(screen.getByLabelText('Step in progress')).toBeInTheDocument();
  });

  it('shows the queued indicator when status is pending', () => {
    render(<PendingProgressStep step={make({ status: 'pending' })} />);
    expect(screen.getByLabelText('Step queued')).toBeInTheDocument();
  });
});
