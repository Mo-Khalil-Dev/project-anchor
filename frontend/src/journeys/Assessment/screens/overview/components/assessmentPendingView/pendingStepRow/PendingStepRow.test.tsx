import { render, screen } from '@testing-library/react';
import { PendingStepRow } from '.';

describe('PendingStepRow', () => {
  it('renders the label', () => {
    render(<PendingStepRow label="Fetching transactions" status="active" />);
    expect(screen.getByText('Fetching transactions')).toBeInTheDocument();
  });

  it('shows the done icon when status is done', () => {
    render(<PendingStepRow label="x" status="done" />);
    expect(screen.getByLabelText('Step complete')).toBeInTheDocument();
  });

  it('shows the active icon when status is active', () => {
    render(<PendingStepRow label="x" status="active" />);
    expect(screen.getByLabelText('Step in progress')).toBeInTheDocument();
  });

  it('shows the pending icon when status is pending', () => {
    render(<PendingStepRow label="x" status="pending" />);
    expect(screen.getByLabelText('Step pending')).toBeInTheDocument();
  });
});
