import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { useReferenceDataContext } from '@/context/ReferenceDataContext';
import { Assessment } from '@/journeys/Assessment/models/assessment';

export function useOverview() {
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
        pollRef.current = setInterval(() => {
          refetch();
        }, 3000);
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
        customerId: '',
        monthlyIncome: referenceData.assessment.monthlyIncome,
        monthlyExpenses: referenceData.assessment.monthlyExpenses,
        disposableIncome: referenceData.assessment.disposableIncome,
        monthlyBill: referenceData.assessment.monthlyBill,
        billRatio: referenceData.assessment.billRatio,
        hardshipLevel: referenceData.assessment.hardshipLevel,
        status: referenceData.assessment.status === 'IN_PROGRESS' ? 'PENDING' : (referenceData.assessment.status as 'PENDING' | 'COMPLETED' | 'FAILED'),
        arrears: 0,
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