import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import authReducer, { setUser } from '@/store/slices/authSlice';
import customerReducer from '@/store/slices/customerSlice';
import adminReducer from '@/store/slices/adminSlice';
import type { AuthUser } from '@/types';
import { AssessmentPendingView } from '.';

vi.mock('./circularProgress/CircularProgress', () => ({
  CircularProgress: ({ progress }: { progress: number }) => <div data-testid="circular">{progress}%</div>,
}));
vi.mock('./linearProgressBar/LinearProgressBar', () => ({
  LinearProgressBar: ({ progress }: { progress: number }) => <div data-testid="linear">{progress}</div>,
}));
vi.mock('./pendingStepRow/PendingStepRow', () => ({
  PendingStepRow: ({ label, status }: { label: string; status: string }) => <div>{status}:{label}</div>,
}));
vi.mock('./emailNotifyCard/EmailNotifyCard', () => ({
  EmailNotifyCard: ({ email }: { email: string }) => <div data-testid="notify">{email}</div>,
}));
vi.mock('./whatHappensNextCard/WhatHappensNextCard', () => ({
  WhatHappensNextCard: () => <div data-testid="what-happens-next" />,
}));

function renderWithStore(calculatedAt: string, user: Partial<AuthUser> | null = null) {
  const store = configureStore({
    reducer: { auth: authReducer, customer: customerReducer, admin: adminReducer },
  });
  if (user) store.dispatch(setUser(user as AuthUser));
  return render(
    <Provider store={store}>
      <AssessmentPendingView calculatedAt={calculatedAt} />
    </Provider>
  );
}

const NOW = new Date('2026-04-27T12:00:00Z').getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

describe('AssessmentPendingView', () => {
  it('renders the headline copy from the spec', () => {
    renderWithStore(new Date(NOW).toISOString());
    expect(screen.getByText('Analysing your finances…')).toBeInTheDocument();
    expect(screen.getByText(/processing your Barclays data/)).toBeInTheDocument();
  });

  it('renders both progress indicators wired to the same value', () => {
    renderWithStore(new Date(NOW).toISOString());
    expect(screen.getByTestId('circular')).toHaveTextContent('0%');
    expect(screen.getByTestId('linear')).toHaveTextContent('0');
  });

  it('renders all five spec steps with the first one active and the rest pending', () => {
    renderWithStore(new Date(NOW).toISOString());
    expect(screen.getByText('active:Fetching transactions from Barclays')).toBeInTheDocument();
    expect(screen.getByText('pending:Categorising 186 transactions')).toBeInTheDocument();
    expect(screen.getByText('pending:Calculating income & expenses')).toBeInTheDocument();
    expect(screen.getByText('pending:Running hardship assessment model')).toBeInTheDocument();
    expect(screen.getByText('pending:Generating payment plan options')).toBeInTheDocument();
  });

  it('renders the email notify card with the signed-in user email', () => {
    renderWithStore(new Date(NOW).toISOString(), { id: '1', email: 'sarah@example.com' });
    expect(screen.getByTestId('notify')).toHaveTextContent('sarah@example.com');
  });

  it('renders the what-happens-next secondary card', () => {
    renderWithStore(new Date(NOW).toISOString());
    expect(screen.getByTestId('what-happens-next')).toBeInTheDocument();
  });

  it('marks the main card as busy for assistive tech', () => {
    renderWithStore(new Date(NOW).toISOString());
    expect(screen.getByLabelText('Assessment in progress')).toHaveAttribute('aria-busy', 'true');
  });
});
