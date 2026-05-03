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
    const mapStatus = (status: string): 'PENDING' | 'COMPLETED' | 'FAILED' => {
      if (status === 'COMPLETED') return 'COMPLETED';
      if (status === 'PENDING' || status === 'IN_PROGRESS') return 'PENDING';
      return 'PENDING';
    };

    const detailedAssessment: AssessmentDetailedDTO = {
      id: assessmentData.id,
      customerId: '',
      status: mapStatus(assessmentData.status),
      hardshipLevel: assessmentData.hardshipLevel,
      disposableIncome: assessmentData.disposableIncome,
      monthlyBill: assessmentData.monthlyBill,
      billRatio: assessmentData.billRatio,
      monthlyIncome: assessmentData.monthlyIncome || 0,
      monthlyExpenses: Object.values(assessmentData.expensesByCategory).reduce((sum, amount) => sum + amount, 0),
      arrears: 0,
      expensesByCategory: assessmentData.expensesByCategory,
      incomeSources: assessmentData.incomeSources as any,
      incomeHistory: assessmentData.incomeHistory as any,
      factors: assessmentData.factors.map(f => ({
        title: f.name,
        description: f.description,
        impact: f.impact,
      })),
      paymentPlans: referenceData.paymentPlans || [],
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
    isLoading: contextLoading,
    error,
  };
}
