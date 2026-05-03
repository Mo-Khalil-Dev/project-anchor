import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PaymentSetupScreen } from './PaymentSetupScreen';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderScreen() {
  return render(
    <BrowserRouter>
      <PaymentSetupScreen />
    </BrowserRouter>
  );
}

describe('PaymentSetupScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title and subtitle', () => {
    renderScreen();
    expect(screen.getByText('How would you like to pay?')).toBeInTheDocument();
    expect(screen.getByText(/Choose your preferred payment method/i)).toBeInTheDocument();
  });

  it('renders all 3 payment methods', () => {
    renderScreen();
    expect(screen.getByText('Direct Debit')).toBeInTheDocument();
    expect(screen.getByText('Card or Bank Transfer')).toBeInTheDocument();
    expect(screen.getByText('Cash at Post Office')).toBeInTheDocument();
  });

  it('renders all method badges', () => {
    renderScreen();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('In-person')).toBeInTheDocument();
  });

  it('shows Direct Debit Guarantee info box when DD is selected (default)', () => {
    renderScreen();
    expect(screen.getByText(/Direct Debit is the most reliable method/i)).toBeInTheDocument();
  });

  it('hides Direct Debit Guarantee info box when other method is selected', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByText('Card or Bank Transfer'));

    expect(screen.queryByText(/Direct Debit is the most reliable method/i)).not.toBeInTheDocument();
  });

  it('shows DD label in continue button by default', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /Set Up Direct Debit/i })).toBeInTheDocument();
  });

  it('updates continue button text when method changes', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByText('Card or Bank Transfer'));

    expect(screen.getByRole('button', { name: /Set Up Card or Bank Transfer/i })).toBeInTheDocument();
  });

  it('renders the Back button', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('navigates to direct-debit when Set Up Direct Debit is clicked', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole('button', { name: /Set Up Direct Debit/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans/direct-debit', { replace: true });
  });

  it('navigates back when Back is clicked', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(screen.getByRole('button', { name: /Back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders all method descriptions', () => {
    renderScreen();
    expect(screen.getByText(/Automatic monthly payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Pay each month manually/i)).toBeInTheDocument();
    expect(screen.getByText(/Pay cash at any Post Office/i)).toBeInTheDocument();
  });
});
