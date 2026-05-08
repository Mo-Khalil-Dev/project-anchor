import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AssessmentBreakdown } from '.';
import { useAssessmentBreakdown } from '../../hooks/useAssessmentBreakdown';
import { MOCK_ASSESSMENT_DETAILED } from '../../mocks/assessmentMockData';
import {useJourneyGuard} from "../../hooks/useJourneyGuard";

vi.mock('../../hooks/useAssessmentBreakdown');
vi.mock('@/hooks/useJourneyGuard');

const mockUseAssessmentBreakdown = useAssessmentBreakdown as ReturnType<typeof vi.fn>;
const mockUseJourneyGuard = useJourneyGuard as ReturnType<typeof vi.fn>;

describe('AssessmentBreakdown', () => {
  beforeEach(() => {
    mockUseJourneyGuard.mockReturnValue({
      status: 'verified',
    } as any);

    mockUseAssessmentBreakdown.mockReturnValue({
      assessment: MOCK_ASSESSMENT_DETAILED,
      activeTab: 'overview',
      setActiveTab: vi.fn(),
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(screen.getByText('Detailed Assessment Breakdown')).toBeInTheDocument();
  });

  it('should render all 4 tabs', () => {
    render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(screen.getAllByRole('button', { name: /Overview/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Expenses/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Income Stability/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Why This Happened/ })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseAssessmentBreakdown.mockReturnValue({
      assessment: null,
      activeTab: 'overview',
      setActiveTab: vi.fn(),
      isLoading: true,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Loading assessment/)).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseAssessmentBreakdown.mockReturnValue({
      assessment: null,
      activeTab: 'overview',
      setActiveTab: vi.fn(),
      isLoading: false,
      error: 'Failed to fetch assessment',
    } as any);

    render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Error: Failed to fetch assessment/)).toBeInTheDocument();
  });

  it('should redirect when not verified', () => {
    mockUseJourneyGuard.mockReturnValue({
      status: 'redirecting',
    } as any);

    const { container } = render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should allow tab switching', async () => {
    const setActiveTab = vi.fn();
    mockUseAssessmentBreakdown.mockReturnValue({
      assessment: MOCK_ASSESSMENT_DETAILED,
      activeTab: 'overview',
      setActiveTab,
      isLoading: false,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    const expensesTab = screen.getByRole('button', { name: /Expenses/ });
    await userEvent.click(expensesTab);

    expect(setActiveTab).toHaveBeenCalledWith('expenses');
  });

  it('matches snapshot with assessment data', () => {
    const { container } = render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should display navigation buttons', () => {
    render(
      <BrowserRouter>
        <AssessmentBreakdown />
      </BrowserRouter>,
    );

    expect(screen.getByRole('button', { name: /View Payment Plan Options/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Overview/ })).toBeInTheDocument();
  });
});
