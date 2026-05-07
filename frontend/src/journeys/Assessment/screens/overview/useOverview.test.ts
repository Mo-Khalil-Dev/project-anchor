import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createElement } from 'react';
import { store } from '@/store';
import { makeAssessment } from '@/test/fixtures';
import { assessmentService } from '@/usecases/assessmentService';
import { useOverview } from './useOverview';

vi.mock('@/usecases/assessmentService', () => ({
  assessmentService: { get: vi.fn() },
}));

const mockGet = vi.mocked(assessmentService.get);
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(
    Provider,
    { store },
    createElement(
      MemoryRouter,
      { initialEntries: ['/assessment/assessment-1'] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: '/assessment/:assessmentId', element: children })
      )
    )
  );
}

describe('useOverview', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGet.mockReset();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in loading state', () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'PENDING' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.assessment).toBeNull();
  });

  it('sets assessment after successful fetch', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'COMPLETED' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.assessment).not.toBeNull());
    expect(result.current.assessment?.id).toBe('assessment-1');
  });

  it('sets loading to false when status is COMPLETED', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'COMPLETED' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('sets loading to false when status is FAILED', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'FAILED' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('stops polling when COMPLETED status is received', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'COMPLETED' }));
    renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    vi.advanceTimersByTime(9000);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('continues polling while status is PENDING', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'PENDING' }));
    renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(6000);
    expect(mockGet.mock.calls.length).toBeGreaterThan(1);
  });

  it('sets error and stops polling on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.error).toBe('Network error'));
    expect(result.current.loading).toBe(false);
    const callCount = mockGet.mock.calls.length;
    vi.advanceTimersByTime(9000);
    expect(mockGet.mock.calls.length).toBe(callCount);
  });

  it('exposes correct derived flags for PENDING status', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'PENDING' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.assessment).not.toBeNull());
    expect(result.current.isPending).toBe(true);
    expect(result.current.isFailed).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it('exposes correct derived flags for COMPLETED status', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'COMPLETED' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.assessment).not.toBeNull());
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isFailed).toBe(false);
  });

  it('formats assessmentDate from calculatedAt', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'COMPLETED', calculatedAt: '2026-01-15T10:30:00Z' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.assessmentDate).not.toBe(''));
    expect(result.current.assessmentDate).toMatch(/15/);
    expect(result.current.assessmentDate).toMatch(/2026/);
  });

  it('handleGoBack calls navigate(-1)', async () => {
    mockGet.mockResolvedValue(makeAssessment({ status: 'COMPLETED' }));
    const { result } = renderHook(() => useOverview(), { wrapper });
    await waitFor(() => expect(result.current.assessment).not.toBeNull());
    result.current.handleGoBack();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
