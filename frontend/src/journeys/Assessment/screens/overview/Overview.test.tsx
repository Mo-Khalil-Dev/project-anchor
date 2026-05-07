import { render, screen } from '@testing-library/react';
import { makeAssessment } from '@/test/fixtures';
import { AssessmentOverview } from '.';

vi.mock('./useOverview');
vi.mock('@/components/layouts/CustomerLayout', () => ({
  CustomerLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./components/overviewLoadingState/OverviewLoadingState', () => ({
  OverviewLoadingState: () => <div>loading-state</div>,
}));
vi.mock('./components/overviewErrorState/OverviewErrorState', () => ({
  OverviewErrorState: ({ error }: { error: string }) => <div>error: {error}</div>,
}));
vi.mock('./components/assessmentContent/AssessmentContent', () => ({
  AssessmentContent: () => <div>assessment-content</div>,
}));

const { useOverview } = await import('./useOverview');
const mockUseOverview = vi.mocked(useOverview);

const baseHookReturn = {
  assessment: null,
  loading: false,
  error: null,
  isPending: false,
  isFailed: false,
  isCompleted: false,
  assessmentDate: '',
  handleExplorePaymentPlans: vi.fn(),
  handleGoBack: vi.fn(),
};

describe('AssessmentOverview', () => {
  it('shows loading state when loading with no assessment', () => {
    mockUseOverview.mockReturnValue({ ...baseHookReturn, loading: true });
    render(<AssessmentOverview />);
    expect(screen.getByText('loading-state')).toBeInTheDocument();
  });

  it('shows error state when there is an error and no assessment', () => {
    mockUseOverview.mockReturnValue({ ...baseHookReturn, error: 'API down' });
    render(<AssessmentOverview />);
    expect(screen.getByText('error: API down')).toBeInTheDocument();
  });

  it('does not show loading when assessment is present', () => {
    mockUseOverview.mockReturnValue({ ...baseHookReturn, loading: true, assessment: makeAssessment() });
    render(<AssessmentOverview />);
    expect(screen.queryByText('loading-state')).not.toBeInTheDocument();
  });

  it('renders AssessmentContent when assessment exists', () => {
    mockUseOverview.mockReturnValue({ ...baseHookReturn, assessment: makeAssessment(), isCompleted: true });
    render(<AssessmentOverview />);
    expect(screen.getByText('assessment-content')).toBeInTheDocument();
  });

  it('does not render AssessmentContent when no assessment', () => {
    mockUseOverview.mockReturnValue({ ...baseHookReturn });
    render(<AssessmentOverview />);
    expect(screen.queryByText('assessment-content')).not.toBeInTheDocument();
  });
});
