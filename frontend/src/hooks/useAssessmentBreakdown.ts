/**
 * useAssessmentBreakdown Hook
 *
 * Fetches latest assessment from reference data context.
 * Falls back to MOCK_ASSESSMENT_DETAILED if VITE_USE_MOCK_ASSESSMENT=true
 * or if backend is unreachable in development.
 *
 * Redirects to /account-setup if no assessment exists.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReferenceDataContext } from '@/context/ReferenceDataContext';
import type { AssessmentDetailedDTO } from '../types';
import { MOCK_ASSESSMENT_DETAILED } from '../mocks/assessmentMockData';

export type AssessmentTab = 'overview' | 'expenses' | 'income' | 'factors';

export interface UseAssessmentBreakdownReturn {
  assessment: AssessmentDetailedDTO | null;
  activeTab: AssessmentTab;
  setActiveTab: (tab: AssessmentTab) => void;
  isLoading: boolean;
  error: string | null;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_ASSESSMENT === 'true';

export function useAssessmentBreakdown(): UseAssessmentBreakdownReturn {
  const navigate = useNavigate();
  const { data: referenceData, isLoading: contextLoading, error: contextError } = useReferenceDataContext();
  const [assessment, setAssessment] = useState<AssessmentDetailedDTO | null>(null);
  const [activeTab, setActiveTab] = useState<AssessmentTab>('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK) {
      setAssessment(MOCK_ASSESSMENT_DETAILED);
      return;
    }

    if (contextError) {
      setError(contextError);
      return;
    }

    if (!referenceData?.assessment) {
      if (!contextLoading) {
        navigate('/account-setup');
      }
      return;
    }

    const assessmentData = referenceData.assessment;
    const detailedAssessment: AssessmentDetailedDTO = {
      id: assessmentData.id,
      customerId: '',
      status: assessmentData.status,
      hardshipLevel: assessmentData.hardshipLevel,
      disposableIncome: assessmentData.disposableIncome,
      monthlyBill: assessmentData.monthlyBill,
      billRatio: assessmentData.billRatio,
      expensesByCategory: assessmentData.expensesByCategory,
      incomeSources: assessmentData.incomeSources,
      incomeHistory: assessmentData.incomeHistory,
      factors: assessmentData.factors,
      createdAt: assessmentData.createdAt,
      updatedAt: assessmentData.createdAt,
    };

    setAssessment(detailedAssessment);
    setError(null);
  }, [referenceData?.assessment, contextLoading, contextError, navigate]);

  return {
    assessment,
    activeTab,
    setActiveTab,
    isLoading,
    error,
  };
}
