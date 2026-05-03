import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import customerReducer from '@/store/slices/customerSlice';
import { DirectDebitSetupScreen } from './DirectDebitSetupScreen';
import { useAssessmentBreakdown } from '@/hooks/useAssessmentBreakdown';
import type { AssessmentDetailedDTO } from '@/types';

vi.mock('@/hooks/useAssessmentBreakdown');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    { type: 'Conservative', monthlyAmount: 70, duration: 12, totalRepayment: 840, sustainability: 'HIGH' },
    { type: 'Balanced', monthlyAmount: 90, duration: 9, totalRepayment: 810, sustainability: 'MEDIUM' },
    { type: 'Aggressive', monthlyAmount: 100, duration: 8, totalRepayment: 800, sustainability: 'LOW' },
  ],
  createdAt: new Date().toISOString(),
};

function renderWithProviders(selectedPlan: string | null = 'conservative') {
  const store = configureStore({
    reducer: {
      customer: customerReducer,
    },
    preloadedState: {
      customer: {
        selectedPlan,
        linkedUtilityAccount: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <DirectDebitSetupScreen />
      </BrowserRouter>
    </Provider>
  );
}

describe('DirectDebitSetupScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssessmentBreakdown).mockReturnValue({
      assessment: mockAssessment,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('rendering', () => {
    it('renders the title and subtitle', () => {
      renderWithProviders();
      expect(screen.getByText('Set Up Direct Debit')).toBeInTheDocument();
      expect(screen.getByText(/Your bank details are encrypted/i)).toBeInTheDocument();
    });

    it('renders all bank detail form fields', () => {
      renderWithProviders();
      expect(screen.getByPlaceholderText('Sarah Mitchell')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('20-00-00')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('12345678')).toBeInTheDocument();
    });

    it('renders all 11 payment day buttons', () => {
      renderWithProviders();
      const days = [1, 5, 8, 10, 12, 15, 17, 20, 22, 25, 28];
      days.forEach(day => {
        expect(screen.getByRole('button', { name: String(day) })).toBeInTheDocument();
      });
    });

    it('renders the Direct Debit Guarantee text', () => {
      renderWithProviders();
      expect(screen.getByText(/Direct Debit Guarantee/i)).toBeInTheDocument();
    });

    it('renders the Confirm Direct Debit button', () => {
      renderWithProviders();
      expect(screen.getByRole('button', { name: /Confirm Direct Debit/i })).toBeInTheDocument();
    });

    it('renders the Back button', () => {
      renderWithProviders();
      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('shows error when no plan is selected', () => {
      renderWithProviders(null);
      expect(screen.getByText('No plan selected')).toBeInTheDocument();
    });
  });

  describe('payment summary', () => {
    it('displays plan amount in the summary', () => {
      renderWithProviders();
      expect(screen.getByText('£70.00')).toBeInTheDocument();
    });

    it('displays plan duration in the summary', () => {
      renderWithProviders();
      expect(screen.getByText('12 payments')).toBeInTheDocument();
    });

    it('displays placeholder dashes when form fields are empty', () => {
      renderWithProviders();
      const dashes = screen.getAllByText('—');
      // 3 fields: account name, sort code, account number
      expect(dashes.length).toBeGreaterThanOrEqual(3);
    });

    it('updates summary as account holder name is filled', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      await user.type(screen.getByPlaceholderText('Sarah Mitchell'), 'Sarah Mitchell');

      expect(screen.getAllByText('Sarah Mitchell').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('form validation', () => {
    it('disables the Confirm button when form is empty', () => {
      renderWithProviders();
      expect(screen.getByRole('button', { name: /Confirm Direct Debit/i })).toBeDisabled();
    });

    it('enables the Confirm button when all fields are valid', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      await user.type(screen.getByPlaceholderText('Sarah Mitchell'), 'Sarah Mitchell');
      await user.type(screen.getByPlaceholderText('20-00-00'), '200000');
      await user.type(screen.getByPlaceholderText('12345678'), '12345678');

      expect(screen.getByRole('button', { name: /Confirm Direct Debit/i })).not.toBeDisabled();
    });

    it('keeps Confirm button disabled when sort code is incomplete', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      await user.type(screen.getByPlaceholderText('Sarah Mitchell'), 'Sarah Mitchell');
      await user.type(screen.getByPlaceholderText('20-00-00'), '20000');
      await user.type(screen.getByPlaceholderText('12345678'), '12345678');

      expect(screen.getByRole('button', { name: /Confirm Direct Debit/i })).toBeDisabled();
    });

    it('keeps Confirm button disabled when account number is incomplete', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      await user.type(screen.getByPlaceholderText('Sarah Mitchell'), 'Sarah Mitchell');
      await user.type(screen.getByPlaceholderText('20-00-00'), '200000');
      await user.type(screen.getByPlaceholderText('12345678'), '1234567');

      expect(screen.getByRole('button', { name: /Confirm Direct Debit/i })).toBeDisabled();
    });
  });

  describe('user interactions', () => {
    it('formats sort code with dashes as user types', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const sortCodeInput = screen.getByPlaceholderText('20-00-00') as HTMLInputElement;
      await user.type(sortCodeInput, '200000');

      expect(sortCodeInput.value).toBe('20-00-00');
    });

    it('limits account number to 8 digits', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      const accountInput = screen.getByPlaceholderText('12345678') as HTMLInputElement;
      await user.type(accountInput, '1234567890');

      expect(accountInput.value).toBe('12345678');
    });

    it('navigates back when Back is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders();

      await user.click(screen.getByRole('button', { name: /Back/i }));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
