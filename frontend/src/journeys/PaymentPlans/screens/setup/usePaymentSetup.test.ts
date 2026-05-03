import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { usePaymentSetup } from './usePaymentSetup';

vi.mock('react-router-dom');

describe('usePaymentSetup', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('defaults to Direct Debit (dd) selection', () => {
    const { result } = renderHook(() => usePaymentSetup());
    expect(result.current.selected).toBe('dd');
  });

  it('updates selection when setSelected is called', () => {
    const { result } = renderHook(() => usePaymentSetup());

    act(() => {
      result.current.setSelected('card');
    });

    expect(result.current.selected).toBe('card');
  });

  it('navigates to direct-debit setup when DD is confirmed', () => {
    const { result } = renderHook(() => usePaymentSetup());

    act(() => {
      result.current.handleContinue();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans/direct-debit', { replace: true });
  });

  it('does not navigate when card method is selected (not implemented)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => usePaymentSetup());

    act(() => {
      result.current.setSelected('card');
    });

    act(() => {
      result.current.handleContinue();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('card'));

    consoleSpy.mockRestore();
  });

  it('does not navigate when cash method is selected (not implemented)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => usePaymentSetup());

    act(() => {
      result.current.setSelected('cash');
    });

    act(() => {
      result.current.handleContinue();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('cash'));

    consoleSpy.mockRestore();
  });

  it('navigates back when handleBack is called', () => {
    const { result } = renderHook(() => usePaymentSetup());

    act(() => {
      result.current.handleBack();
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
