import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOverview } from './useOverview';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockRefetch = vi.fn();

let mockContextValue: any = {
  data: null,
  isLoading: false,
  error: null,
  refetch: mockRefetch,
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('@/store/slices/customerSlice', () => ({
  setCurrentStep: (step: string) => ({ type: 'setCurrentStep', payload: step }),
}));

vi.mock('@/context/ReferenceDataContext', () => ({
  useReferenceDataContext: () => mockContextValue,
}));

describe('useOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContextValue = {
      data: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };
  });

  it('returns null assessment when no reference data', () => {
    const { result } = renderHook(() => useOverview());
    expect(result.current.assessment).toBeNull();
  });

  it('returns loading from context', () => {
    mockContextValue.isLoading = true;
    const { result } = renderHook(() => useOverview());
    expect(result.current.loading).toBe(true);
  });

  it('returns error from context', () => {
    mockContextValue.error = 'Network error';
    const { result } = renderHook(() => useOverview());
    expect(result.current.error).toBe('Network error');
  });

  it('maps assessment from reference data', () => {
    mockContextValue.data = {
      assessment: {
        id: 'assessment-1',
        status: 'COMPLETED',
        monthlyIncome: 3000,
        monthlyExpenses: 1800,
        disposableIncome: 1200,
        monthlyBill: 450,
        billRatio: 37.5,
        hardshipLevel: 'SEVERE',
        createdAt: '2026-01-15T10:30:00Z',
      },
    };
    const { result } = renderHook(() => useOverview());
    expect(result.current.assessment?.id).toBe('assessment-1');
    expect(result.current.isCompleted).toBe(true);
  });

  it('maps PENDING status correctly', () => {
    mockContextValue.data = {
      assessment: {
        id: 'assessment-1',
        status: 'PENDING',
        monthlyIncome: 0,
        monthlyExpenses: 0,
        disposableIncome: 0,
        monthlyBill: 0,
        billRatio: 0,
        hardshipLevel: 'NONE',
        createdAt: '2026-01-15T10:30:00Z',
      },
    };
    const { result } = renderHook(() => useOverview());
    expect(result.current.isPending).toBe(true);
    expect(result.current.isCompleted).toBe(false);
  });

  it('maps FAILED status correctly', () => {
    mockContextValue.data = {
      assessment: {
        id: 'assessment-1',
        status: 'FAILED',
        monthlyIncome: 0,
        monthlyExpenses: 0,
        disposableIncome: 0,
        monthlyBill: 0,
        billRatio: 0,
        hardshipLevel: 'NONE',
        createdAt: '2026-01-15T10:30:00Z',
      },
    };
    const { result } = renderHook(() => useOverview());
    expect(result.current.isFailed).toBe(true);
  });

  it('formats assessmentDate', () => {
    mockContextValue.data = {
      assessment: {
        id: 'assessment-1',
        status: 'COMPLETED',
        monthlyIncome: 3000,
        monthlyExpenses: 1800,
        disposableIncome: 1200,
        monthlyBill: 450,
        billRatio: 37.5,
        hardshipLevel: 'SEVERE',
        createdAt: '2026-01-15T10:30:00Z',
      },
    };
    const { result } = renderHook(() => useOverview());
    expect(result.current.assessmentDate).toMatch(/15/);
    expect(result.current.assessmentDate).toMatch(/2026/);
  });

  it('handleGoBack calls navigate(-1)', () => {
    const { result } = renderHook(() => useOverview());
    result.current.handleGoBack();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('handleViewBreakdown navigates to breakdown', () => {
    const { result } = renderHook(() => useOverview());
    result.current.handleViewBreakdown();
    expect(mockNavigate).toHaveBeenCalledWith('/assessment/breakdown');
  });

  it('handleExplorePaymentPlans dispatches and navigates', () => {
    const { result } = renderHook(() => useOverview());
    result.current.handleExplorePaymentPlans();
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans');
  });
});
