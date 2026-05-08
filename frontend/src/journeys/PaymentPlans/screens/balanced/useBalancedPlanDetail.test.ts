import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useBalancedPlanDetail } from './useBalancedPlanDetail';

vi.mock('react-redux');
vi.mock('react-router-dom');

describe('useBalancedPlanDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches setSelectedPlan when handleSelectPlan called', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useBalancedPlanDetail());

    act(() => {
      result.current.handleSelectPlan();
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('navigates to terms page on select', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useBalancedPlanDetail());

    act(() => {
      result.current.handleSelectPlan();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans/terms');
  });

  it('navigates back to plan options on back', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useBalancedPlanDetail());

    act(() => {
      result.current.handleBack();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans');
  });
});
