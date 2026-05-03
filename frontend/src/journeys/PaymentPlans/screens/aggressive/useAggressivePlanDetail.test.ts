import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAggressivePlanDetail } from './useAggressivePlanDetail';

vi.mock('react-redux');
vi.mock('react-router-dom');

describe('useAggressivePlanDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with confirmed as false', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useAggressivePlanDetail());

    expect(result.current.confirmed).toBe(false);
  });

  it('sets confirmed to true when setConfirmed called', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useAggressivePlanDetail());

    act(() => {
      result.current.setConfirmed(true);
    });

    expect(result.current.confirmed).toBe(true);
  });

  it('does not select plan unless confirmed', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useAggressivePlanDetail());

    act(() => {
      result.current.handleSelectPlan();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('selects plan when confirmed and handleSelectPlan called', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useAggressivePlanDetail());

    act(() => {
      result.current.setConfirmed(true);
      result.current.handleSelectPlan();
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans/terms');
  });

  it('switches to conservative plan', () => {
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useAggressivePlanDetail());

    act(() => {
      result.current.handleSwitchToConservative();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/payment-plans/conservative');
  });
});
