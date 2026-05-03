import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import customerReducer from '@/store/slices/customerSlice';
import { TermsAndConditions } from './TermsAndConditions';
import type { AssessmentDetailedDTO } from '@/types';

const mockAssessment: AssessmentDetailedDTO = {
  id: '1',
  customerId: '1',
  hardshipLevel: 'MODERATE',
  disposableIncome: 500,
  billRatio: 15,
  monthlyBill: 100,
  monthlyIncome: 2000,
  monthlyExpenses: 1500,
  arrears: 300,
  expensesByCategory: { housing: 800, food: 300, utilities: 100, transport: 200, other: 100 },
  incomeHistory: [{ month: 'Jan', amount: 2000 }],
  incomeSources: [{ type: 'Salary', amount: 2000, frequency: 'Monthly' }],
  factors: [{ title: 'High utility bills', description: 'Bills exceed typical spend' }],
  paymentPlans: [
    {
      type: 'Conservative',
      monthlyAmount: 70,
      duration: 12,
      totalRepayment: 840,
      sustainability: 'HIGH',
    },
    {
      type: 'Balanced',
      monthlyAmount: 90,
      duration: 9,
      totalRepayment: 810,
      sustainability: 'MEDIUM',
    },
    {
      type: 'Aggressive',
      monthlyAmount: 100,
      duration: 8,
      totalRepayment: 800,
      sustainability: 'LOW',
    },
  ],
  createdAt: new Date().toISOString(),
};

function renderWithProviders(component: React.ReactNode) {
  const store = configureStore({
    reducer: {
      customer: customerReducer,
    },
    preloadedState: {
      customer: {
        selectedPlan: 'conservative',
        linkedUtilityAccount: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
}

describe('TermsAndConditions', () => {
  it('renders terms content', () => {
    renderWithProviders(<TermsAndConditions assessment={mockAssessment} />);
    expect(screen.getByText('Plan Agreement')).toBeInTheDocument();
    expect(screen.getByText(/written in plain English/i)).toBeInTheDocument();
  });

  it('displays selected plan details', () => {
    renderWithProviders(<TermsAndConditions assessment={mockAssessment} />);
    expect(screen.getByText('Conservative')).toBeInTheDocument();
    expect(screen.getByText('£70')).toBeInTheDocument();
    expect(screen.getByText('12 months')).toBeInTheDocument();
  });

  it('disables continue button until agreed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TermsAndConditions assessment={mockAssessment} />);

    const continueButton = screen.getByRole('button', { name: /continue to payment setup/i });
    expect(continueButton).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(continueButton).not.toBeDisabled();
  });

  it('shows error when no plan selected', () => {
    const store = configureStore({
      reducer: {
        customer: customerReducer,
      },
      preloadedState: {
        customer: {
          selectedPlan: null,
          linkedUtilityAccount: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <TermsAndConditions assessment={mockAssessment} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('No plan selected')).toBeInTheDocument();
  });
});
