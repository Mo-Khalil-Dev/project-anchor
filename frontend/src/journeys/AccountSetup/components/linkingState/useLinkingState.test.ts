import { act, renderHook } from '@testing-library/react';
import { useLinkingState } from './useLinkingState';

describe('useLinkingState', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useLinkingState({ onSuccess, onError, submitDelayMs: 100 }));
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

  it('routes a non-ERR account ref to onSuccess', () => {
    const { result, onSuccess, onError } = setup();
    act(() => result.current.setUtilityType('gas'));
    act(() => result.current.submitDetails({ postcode: 'SW1A 1AA', accountRef: '12345' }));
    expect(result.current.loading).toBe(true);
    act(() => { vi.advanceTimersByTime(100); });
    expect(onSuccess).toHaveBeenCalledWith({ utilityType: 'gas', postcode: 'SW1A 1AA', accountRef: '12345' });
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('routes an ERR-prefixed account ref to onError', () => {
    const { result, onSuccess, onError } = setup();
    act(() => result.current.setUtilityType('electricity'));
    act(() => result.current.submitDetails({ postcode: 'SW1A 1AA', accountRef: 'ERR123' }));
    act(() => { vi.advanceTimersByTime(100); });
    expect(onError).toHaveBeenCalledWith({ utilityType: 'electricity', postcode: 'SW1A 1AA', accountRef: 'ERR123' });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('refuses to submit if no utility type is selected', () => {
    const { result, onSuccess, onError } = setup();
    act(() => result.current.submitDetails({ postcode: 'SW1A 1AA', accountRef: '12345' }));
    act(() => { vi.advanceTimersByTime(100); });
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
