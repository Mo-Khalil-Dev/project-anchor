import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import axiosInstance from '@/api/client';
import { Assessment } from '@/journeys/Assessment/models/assessment';

export function useOverview() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchAssessment = useCallback(async () => {
    try {
      if (!assessmentId) {
        setError('Assessment ID is required');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/assessments/${assessmentId}`);
      const data = response.data as Assessment;

      setAssessment(data);
      setError(null);

      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        setLoading(false);
        stopPolling();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assessment';
      setError(message);
      setLoading(false);
      stopPolling();
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchAssessment();
    pollRef.current = setInterval(fetchAssessment, 3000);
    return () => stopPolling();
  }, [fetchAssessment]);

  const handleExplorePaymentPlans = () => {
    dispatch(setCurrentStep('plan-select'));
    navigate('/plan-select');
  };

  const handleGoBack = () => navigate(-1);

  const assessmentDate = assessment
    ? new Date(assessment.calculatedAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isPending = assessment?.status === 'PENDING';
  const isFailed = assessment?.status === 'FAILED';
  const isCompleted = assessment?.status === 'COMPLETED';

  return {
    assessment,
    loading,
    error,
    isPending,
    isFailed,
    isCompleted,
    assessmentDate,
    handleExplorePaymentPlans,
    handleGoBack,
  };
}