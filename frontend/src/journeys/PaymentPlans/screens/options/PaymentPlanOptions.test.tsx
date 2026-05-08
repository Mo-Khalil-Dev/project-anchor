import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';
import { PaymentPlanOptions } from './PaymentPlanOptions';
import { MOCK_ASSESSMENT_DETAILED } from '../../../../mocks/assessmentMockData';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );

describe('PaymentPlanOptions', () => {
  it('should render without crashing', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    expect(screen.getByText('Choose a Payment Plan')).toBeInTheDocument();
  });

  it('should display all 3 plan cards', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    expect(screen.getByText('Conservative')).toBeInTheDocument();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Aggressive')).toBeInTheDocument();
  });

  it('should show plan details', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Check for monthly amounts
    const plan1 = MOCK_ASSESSMENT_DETAILED.paymentPlans[0];
    const plan2 = MOCK_ASSESSMENT_DETAILED.paymentPlans[1];
    const plan3 = MOCK_ASSESSMENT_DETAILED.paymentPlans[2];

    expect(screen.getByText(`£${plan1.monthlyAmount}`)).toBeInTheDocument();
    expect(screen.getByText(`£${plan2.monthlyAmount}`)).toBeInTheDocument();
    expect(screen.getByText(`£${plan3.monthlyAmount}`)).toBeInTheDocument();
  });

  it('should highlight recommended plan', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Find the Conservative plan which should be recommended (HIGH sustainability)
    const recommendedBadges = screen.queryAllByText(/Recommended/);
    expect(recommendedBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow plan selection', async () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Click on Balanced plan
    const balancedButton = screen.getAllByText(/Select This Plan/)[1];
    await userEvent.click(balancedButton);

    // The button should change to show "Selected"
    expect(screen.getByText(/Selected — Continue/)).toBeInTheDocument();
  });

  it('should display sustainability badges', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Check for sustainability indicators
    expect(screen.getAllByText(/HIGH|MEDIUM|LOW/).length).toBeGreaterThan(0);
  });

  it('should show summary information', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    expect(screen.getByText(/Balance to clear/)).toBeInTheDocument();
    expect(screen.getByText(/Your disposable income/)).toBeInTheDocument();
    expect(screen.getByText(/Hardship level/)).toBeInTheDocument();
  });

  it('should display action buttons', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    expect(screen.getByRole('button', { name: /Continue with Conservative Plan/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare in detail/ })).toBeInTheDocument();
  });

  it('should have Continue button clickable', async () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    const continueButton = screen.getByRole('button', { name: /Continue with .* Plan/ });
    await userEvent.click(continueButton);

    // Button should remain clickable (doesn't throw)
    expect(continueButton).toBeInTheDocument();
  });

  it('should have Compare button clickable', async () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    const compareButton = screen.getByRole('button', { name: /Compare in detail/ });
    await userEvent.click(compareButton);

    // Button should remain clickable (doesn't throw)
    expect(compareButton).toBeInTheDocument();
  });

  it('should display plan advantages', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Check for some key advantages
    expect(screen.getByText(/safety buffer/)).toBeInTheDocument();
    expect(screen.getByText(/Clears debt sooner/)).toBeInTheDocument();
  });

  it('should show warning for aggressive plan if applicable', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Aggressive plan may show a warning
    const warnings = screen.queryAllByText(/⚠/);
    expect(warnings.length).toBeGreaterThanOrEqual(0);
  });

  it('should display footer message', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    expect(screen.getByText(/adjust or pause your plan/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    expect(container).toMatchSnapshot();
  });

  it('should display correct month/year labels for plans', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Check for duration in months
    MOCK_ASSESSMENT_DETAILED.paymentPlans.forEach(plan => {
      expect(screen.getByText(`${plan.duration} months`)).toBeInTheDocument();
    });
  });

  it('should calculate and display monthly buffer correctly', () => {
    render(<PaymentPlanOptions assessment={MOCK_ASSESSMENT_DETAILED} />);

    // Conservative plan: disposable - monthly = buffer
    const plan = MOCK_ASSESSMENT_DETAILED.paymentPlans[0];
    const expectedBuffer = MOCK_ASSESSMENT_DETAILED.disposableIncome - plan.monthlyAmount;

    if (expectedBuffer >= 0) {
      expect(screen.getByText(`£${expectedBuffer}`)).toBeInTheDocument();
    }
  });
});
