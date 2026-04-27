import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer, { setUser } from '@/store/slices/authSlice';
import customerReducer from '@/store/slices/customerSlice';
import adminReducer from '@/store/slices/adminSlice';
import type { AuthUser } from '@/types';
import { useAccountSetupPage } from './useAccountSetupPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeStore(user: Partial<AuthUser> | null) {
  const store = configureStore({
    reducer: { auth: authReducer, customer: customerReducer, admin: adminReducer },
  });
  if (user) store.dispatch(setUser(user as AuthUser));
  return store;
}

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, createElement(MemoryRouter, null, children));
}

beforeEach(() => mockNavigate.mockReset());

describe('useAccountSetupPage', () => {
  it('starts on the checking step by default', () => {
    const { result } = renderHook(() => useAccountSetupPage(), { wrapper: makeWrapper(makeStore(null)) });
    expect(result.current.step).toBe('checking');
    expect(result.current.linkDetails).toBeNull();
  });

  it('builds full name and initials from first + last name', () => {
    const store = makeStore({ id: '1', email: 's@example.com', firstName: 'Sarah', lastName: 'Mitchell' });
    const { result } = renderHook(() => useAccountSetupPage(), { wrapper: makeWrapper(store) });
    expect(result.current.userName).toBe('Sarah Mitchell');
    expect(result.current.userInitials).toBe('SM');
  });

  it('falls back to email when name is missing', () => {
    const store = makeStore({ id: '1', email: 'a@example.com' });
    const { result } = renderHook(() => useAccountSetupPage(), { wrapper: makeWrapper(store) });
    expect(result.current.userName).toBe('a@example.com');
    expect(result.current.userInitials).toBe('A');
  });

  it('captures linkDetails when transitioning to success or error', () => {
    const { result } = renderHook(() => useAccountSetupPage(), { wrapper: makeWrapper(makeStore(null)) });
    const details = { utilityType: 'water' as const, postcode: 'SW1A 1AA', accountRef: '12345' };
    act(() => result.current.goToSuccess(details));
    expect(result.current.step).toBe('success');
    expect(result.current.linkDetails).toEqual(details);
    act(() => result.current.goToError({ ...details, accountRef: 'ERR99' }));
    expect(result.current.step).toBe('error');
    expect(result.current.linkDetails?.accountRef).toBe('ERR99');
  });

  it('navigates to /bank-connection when navigateToBankConnection is invoked', () => {
    const { result } = renderHook(() => useAccountSetupPage(), { wrapper: makeWrapper(makeStore(null)) });
    act(() => result.current.navigateToBankConnection());
    expect(mockNavigate).toHaveBeenCalledWith('/bank-connection', { replace: true });
  });

  it('honours a custom bankConnectionPath option', () => {
    const { result } = renderHook(() => useAccountSetupPage({ bankConnectionPath: '/custom/path' }), { wrapper: makeWrapper(makeStore(null)) });
    act(() => result.current.navigateToBankConnection());
    expect(mockNavigate).toHaveBeenCalledWith('/custom/path', { replace: true });
  });
});
