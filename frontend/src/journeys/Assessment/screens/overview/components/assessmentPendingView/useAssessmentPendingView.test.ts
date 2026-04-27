import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import authReducer, { setUser } from '@/store/slices/authSlice';
import customerReducer from '@/store/slices/customerSlice';
import adminReducer from '@/store/slices/adminSlice';
import type { AuthUser } from '@/types';
import { PROGRESS_CAP, useAssessmentPendingView } from './useAssessmentPendingView';

function makeStore(user: Partial<AuthUser> | null) {
  const store = configureStore({
    reducer: { auth: authReducer, customer: customerReducer, admin: adminReducer },
  });
  if (user) store.dispatch(setUser(user as AuthUser));
  return store;
}

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return ({ children }: { children: ReactNode }) => createElement(Provider, { store }, children);
}

/** Set Date.now() to a fixed reference so we can drive elapsed time via the timestamp. */
const NOW = new Date('2026-04-27T12:00:00Z').getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

function calculatedAtForElapsed(elapsedMs: number): string {
  return new Date(NOW - elapsedMs).toISOString();
}

describe('useAssessmentPendingView', () => {
  it('returns 0% progress and the first step active right after the assessment starts', () => {
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: calculatedAtForElapsed(0) }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.progress).toBe(0);
    expect(result.current.activeStepLabel).toBe('Fetching transactions from Barclays');
    expect(result.current.steps.map((s) => s.status)).toEqual(['active', 'pending', 'pending', 'pending', 'pending']);
  });

  it('promotes step 1 to active once 2.8 s has elapsed and marks step 0 as done', () => {
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: calculatedAtForElapsed(2_800) }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.activeStepLabel).toBe('Categorising 186 transactions');
    expect(result.current.steps.map((s) => s.status)).toEqual(['done', 'active', 'pending', 'pending', 'pending']);
  });

  it('advances to step 4 once 9.4 s has elapsed', () => {
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: calculatedAtForElapsed(9_400) }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.activeStepLabel).toBe('Generating payment plan options');
    expect(result.current.steps.map((s) => s.status)).toEqual(['done', 'done', 'done', 'done', 'active']);
  });

  it('caps progress at 92 % even after a long elapsed time', () => {
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: calculatedAtForElapsed(10 * 60 * 1000) }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.progress).toBe(PROGRESS_CAP);
  });

  it('exposes the user email from Redux', () => {
    const store = makeStore({ id: '1', email: 'sarah.mitchell@example.com' });
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: calculatedAtForElapsed(0) }),
      { wrapper: makeWrapper(store) },
    );
    expect(result.current.userEmail).toBe('sarah.mitchell@example.com');
  });

  it('returns an empty string for userEmail when no user is in state', () => {
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: calculatedAtForElapsed(0) }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.userEmail).toBe('');
  });

  it('updates progress and step state on each tick as wall-clock time advances', () => {
    const calculatedAt = calculatedAtForElapsed(0);
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt, tickIntervalMs: 200 }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.activeStepLabel).toBe('Fetching transactions from Barclays');

    // Advance wall-clock time past the second step's start
    act(() => { vi.setSystemTime(NOW + 3_000); vi.advanceTimersByTime(200); });
    expect(result.current.activeStepLabel).toBe('Categorising 186 transactions');

    // And past the fifth step's start
    act(() => { vi.setSystemTime(NOW + 10_000); vi.advanceTimersByTime(200); });
    expect(result.current.activeStepLabel).toBe('Generating payment plan options');
  });

  it('treats invalid calculatedAt as zero elapsed (degrades gracefully)', () => {
    const { result } = renderHook(
      () => useAssessmentPendingView({ calculatedAt: 'not-a-date' }),
      { wrapper: makeWrapper(makeStore(null)) },
    );
    expect(result.current.progress).toBe(0);
    expect(result.current.activeStepLabel).toBe('Fetching transactions from Barclays');
  });
});
