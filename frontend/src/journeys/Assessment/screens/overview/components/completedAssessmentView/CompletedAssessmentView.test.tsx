import { render, screen } from '@testing-library/react';
import { makeAssessment } from '@/test/fixtures';
import { CompletedAssessmentView } from './CompletedAssessmentView';

vi.mock('../statCardsGrid/StatCardsGrid', () => ({ StatCardsGrid: () => <div>stat-cards</div> }));
vi.mock('../billRatioCard/BillRatioCard', () => ({ BillRatioCard: () => <div>bill-ratio-card</div> }));
vi.mock('../formulaCard/FormulaCard', () => ({ FormulaCard: () => <div>formula-card</div> }));
vi.mock('./AssessmentCTAs', () => ({ AssessmentCTAs: () => <div>ctas</div> }));

describe('CompletedAssessmentView', () => {
  const defaultProps = {
    assessment: makeAssessment({ hardshipLevel: 'SEVERE' }),
    assessmentDate: '15 January 2026',
    onExplorePaymentPlans: vi.fn(),
  };

  it('renders the hardship level badge', () => {
    render(<CompletedAssessmentView {...defaultProps} />);
    expect(screen.getByText('SEVERE')).toBeInTheDocument();
  });

  it('renders the assessment date', () => {
    render(<CompletedAssessmentView {...defaultProps} />);
    expect(screen.getByText('Assessed on 15 January 2026')).toBeInTheDocument();
  });

  it('renders all child sections', () => {
    render(<CompletedAssessmentView {...defaultProps} />);
    expect(screen.getByText('stat-cards')).toBeInTheDocument();
    expect(screen.getByText('bill-ratio-card')).toBeInTheDocument();
    expect(screen.getByText('formula-card')).toBeInTheDocument();
    expect(screen.getByText('ctas')).toBeInTheDocument();
  });
});
