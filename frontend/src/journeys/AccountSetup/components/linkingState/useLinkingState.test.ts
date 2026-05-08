import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useLinkingState } from './useLinkingState';

const mockLinkCustomer = vi.fn();
const mockRefetch = vi.fn();

vi.mock('@/hooks/useCustomerSetup', () => ({
  useCustomerSetup: () => ({
    loading: false,
    linkCustomer: mockLinkCustomer,
  }),
}));

vi.mock('@/context/ReferenceDataContext', () => ({
  useReferenceDataContext: () => ({
    refetch: mockRefetch,
  }),
}));

describe('useLinkingState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useLinkingState({ onSuccess, onError }));
    return { onSuccess, onError, result };
  }

  it('starts on step 1 with no utility selected', () => {
    const { result } = setup();
    expect(result.current.step).toBe(1);
    expect(result.current.utilityType).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('advances to step 2 when goToDetails is called', () => {
    const { result } = setup();
    act(() => result.current.setUtilityType('water'));
    act(() => result.current.goToDetails());
    expect(result.current.step).toBe(2);
    expect(result.current.utilityType).toBe('water');
  });

  it('routes successful link to onSuccess', async () => {
    mockLinkCustomer.mockResolvedValue({ data: { id: 'customer-1' }, error: null });
    const { result, onSuccess, onError } = setup();

    act(() => result.current.setUtilityType('gas'));
    await act(async () => {
      await result.current.submitDetails({ postcode: 'SW1A 1AA', accountRef: '12345' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ utilityType: 'gas', postcode: 'SW1A 1AA', accountRef: '12345' });
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes failed link to onError', async () => {
    mockLinkCustomer.mockResolvedValue({ data: null, error: 'Not found' });
    const { result, onSuccess, onError } = setup();

    act(() => result.current.setUtilityType('electricity'));
    await act(async () => {
      await result.current.submitDetails({ postcode: 'SW1A 1AA', accountRef: 'ERR123' });
    });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      utilityType: 'electricity',
      postcode: 'SW1A 1AA',
      accountRef: 'ERR123',
    }));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('refuses to submit if no utility type is selected', async () => {
    const { result, onSuccess, onError } = setup();

    await act(async () => {
      await result.current.submitDetails({ postcode: 'SW1A 1AA', accountRef: '12345' });
    });

    expect(mockLinkCustomer).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('returns to step 1 when goBackToTypeSelection is called', () => {
    const { result } = setup();
    act(() => result.current.setUtilityType('water'));
    act(() => result.current.goToDetails());
    act(() => result.current.goBackToTypeSelection());
    expect(result.current.step).toBe(1);
  });
});
