import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { useReferenceDataContext } from '@/context/ReferenceDataContext';
import { Assessment } from '@/journeys/Assessment/models/assessment';

export function useOverview() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: referenceData, isLoading: loading, error, refetch } = useReferenceDataContext();

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    const assessment = referenceData?.assessment;

    if (assessment && (assessment.status === 'COMPLETED')) {
      stopPolling();
    } else if (assessment && (assessment.status === 'PENDING' || assessment.status === 'IN_PROGRESS')) {
      // Poll for assessment updates while pending
      if (!pollRef.current) {
        pollRef.current = setInterval(refetch, 3000);
      }
    }

    return () => stopPolling();
  }, [referenceData?.assessment?.status, refetch]);

  const handleExplorePaymentPlans = () => {
    dispatch(setCurrentStep('plan-select'));
    navigate('/payment-plans');
  };

  const handleViewBreakdown = () => {
    navigate('/assessment/breakdown');
  };

  const handleGoBack = () => navigate(-1);

  const assessment: Assessment | null = referenceData?.assessment
    ? {
        id: referenceData.assessment.id,
        customerId: '', // Not in reference data
        monthlyIncome: referenceData.assessment.disposableIncome,
        monthlyExpenses: 0, // Can be calculated from expensesByCategory
        disposableIncome: referenceData.assessment.disposableIncome,
        monthlyBill: referenceData.assessment.monthlyBill,
        billRatio: referenceData.assessment.billRatio,
        hardshipLevel: referenceData.assessment.hardshipLevel,
        status: referenceData.assessment.status,
        arrears: 0, // Not in reference data
        calculatedAt: referenceData.assessment.createdAt,
      }
    : null;

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
    handleViewBreakdown,
    handleGoBack,
  };
}