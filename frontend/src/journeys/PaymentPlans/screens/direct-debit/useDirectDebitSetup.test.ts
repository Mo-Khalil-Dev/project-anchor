import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDirectDebitSetup } from './useDirectDebitSetup';

vi.mock('react-router-dom');
vi.mock('react-redux');

describe('useDirectDebitSetup', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useSelector).mockReturnValue('conservative');
  });

  describe('initial state', () => {
    it('returns empty form fields by default', () => {
      const { result } = renderHook(() => useDirectDebitSetup());
      expect(result.current.form.accountHolderName).toBe('');
      expect(result.current.form.sortCode).toBe('');
      expect(result.current.form.accountNumber).toBe('');
    });

    it('defaults paymentDay to 15', () => {
      const { result } = renderHook(() => useDirectDebitSetup());
      expect(result.current.paymentDay).toBe(15);
    });

    it('returns the predefined paymentDays array', () => {
      const { result } = renderHook(() => useDirectDebitSetup());
      expect(result.current.paymentDays).toEqual([1, 5, 8, 10, 12, 15, 17, 20, 22, 25, 28]);
    });

    it('isComplete returns false when form is empty', () => {
      const { result } = renderHook(() => useDirectDebitSetup());
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('updateField', () => {
    it('updates accountHolderName as plain text', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountHolderName', 'Sarah Mitchell');
      });

      expect(result.current.form.accountHolderName).toBe('Sarah Mitchell');
    });

    it('formats sortCode with dashes (200000 → 20-00-00)', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('sortCode', '200000');
      });

      expect(result.current.form.sortCode).toBe('20-00-00');
    });

    it('strips non-digits from sortCode', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('sortCode', 'abc123def456');
      });

      expect(result.current.form.sortCode).toBe('12-34-56');
    });

    it('limits sortCode to 6 digits', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('sortCode', '12345678901234');
      });

      // Should only take first 6 digits and format
      expect(result.current.form.sortCode).toBe('12-34-56');
    });

    it('limits accountNumber to 8 digits', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountNumber', '1234567890');
      });

      expect(result.current.form.accountNumber).toBe('12345678');
    });

    it('strips non-digits from accountNumber', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountNumber', 'abc12345678');
      });

      expect(result.current.form.accountNumber).toBe('12345678');
    });
  });

  describe('isComplete', () => {
    it('returns true when all fields are valid', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountHolderName', 'Sarah Mitchell');
        result.current.updateField('sortCode', '200000');
        result.current.updateField('accountNumber', '12345678');
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('returns false when sortCode is incomplete (< 6 digits)', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountHolderName', 'Sarah Mitchell');
        result.current.updateField('sortCode', '20000');
        result.current.updateField('accountNumber', '12345678');
      });

      expect(result.current.isComplete).toBe(false);
    });

    it('returns false when accountNumber is incomplete (< 8 digits)', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountHolderName', 'Sarah Mitchell');
        result.current.updateField('sortCode', '200000');
        result.current.updateField('accountNumber', '1234567');
      });

      expect(result.current.isComplete).toBe(false);
    });

    it('returns false when accountHolderName is too short (≤ 2 chars)', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountHolderName', 'AB');
        result.current.updateField('sortCode', '200000');
        result.current.updateField('accountNumber', '12345678');
      });

      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('setPaymentDay', () => {
    it('updates the payment day', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.setPaymentDay(28);
      });

      expect(result.current.paymentDay).toBe(28);
    });
  });

  describe('handleConfirm', () => {
    it('navigates to confirmation when form is complete', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.updateField('accountHolderName', 'Sarah Mitchell');
        result.current.updateField('sortCode', '200000');
        result.current.updateField('accountNumber', '12345678');
      });

      act(() => {
        result.current.handleConfirm();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/payment-plans/confirmation', { replace: true });
    });

    it('does not navigate when form is incomplete', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.handleConfirm();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleBack', () => {
    it('navigates back', () => {
      const { result } = renderHook(() => useDirectDebitSetup());

      act(() => {
        result.current.handleBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
