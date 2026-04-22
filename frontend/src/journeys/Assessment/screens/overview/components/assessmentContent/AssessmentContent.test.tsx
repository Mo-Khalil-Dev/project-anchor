import { render, screen } from '@testing-library/react';
import { makeAssessment } from '@/test/fixtures';
import { AssessmentContent } from './AssessmentContent';

vi.mock('./PendingBanner', () => ({ PendingBanner: () => <div>pending-banner</div> }));
vi.mock('./FailedBanner', () => ({ FailedBanner: () => <div>failed-banner</div> }));
vi.mock('../completedAssessmentView/CompletedAssessmentView', () => ({
  CompletedAssessmentView: () => <div>completed-view</div>,
}));

const baseProps = {
  assessment: makeAssessment(),
  assessmentDate: '15 January 2026',
  isPending: false,
  isFailed: false,
  isCompleted: false,
  onExplorePaymentPlans: vi.fn(),
};

describe('AssessmentContent', () => {
  it('renders the page heading', () => {
    render(<AssessmentContent {...baseProps} />);
    expect(screen.getByText('Your Financial Assessment')).toBeInTheDocument();
  });

  it('renders the assessment date in the subtitle', () => {
    render(<AssessmentContent {...baseProps} />);
    expect(screen.getByText(/15 January 2026/)).toBeInTheDocument();
  });

  it('shows PendingBanner when isPending is true', () => {
    render(<AssessmentContent {...baseProps} isPending={true} />);
    expect(screen.getByText('pending-banner')).toBeInTheDocument();
    expect(screen.queryByText('failed-banner')).not.toBeInTheDocument();
  });

  it('shows FailedBanner when isFailed is true', () => {
    render(<AssessmentContent {...baseProps} isFailed={true} />);
    expect(screen.getByText('failed-banner')).toBeInTheDocument();
    expect(screen.queryByText('pending-banner')).not.toBeInTheDocument();
  });

  it('shows CompletedAssessmentView when isCompleted is true', () => {
    render(<AssessmentContent {...baseProps} isCompleted={true} />);
    expect(screen.getByText('completed-view')).toBeInTheDocument();
  });

  it('hides CompletedAssessmentView when not completed', () => {
    render(<AssessmentContent {...baseProps} isCompleted={false} />);
    expect(screen.queryByText('completed-view')).not.toBeInTheDocument();
  });
});
