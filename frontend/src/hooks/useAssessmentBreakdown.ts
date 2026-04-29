/**
 * useAssessmentBreakdown Hook
 *
 * Manages assessment breakdown data and tab state.
 * Auto-loads latest assessment for current user.
 * Handles redirect if no assessment exists.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

/**
 * Hook to fetch and manage assessment breakdown data
 *
 * Currently uses mock data. Will swap to real service call when
 * backend API `/api/me/assessment` is available:
 *
 * @example
 * const { assessment, activeTab, setActiveTab, isLoading, error } = useAssessmentBreakdown();
 */
export function useAssessmentBreakdown(): UseAssessmentBreakdownReturn {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentDetailedDTO | null>(null);
  const [activeTab, setActiveTab] = useState<AssessmentTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real service call when backend API is ready:
        // const assessmentService = useAssessmentService();
        // const response = await assessmentService.getCurrentAssessment();

        // For now: Use mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        const mockData = MOCK_ASSESSMENT_DETAILED;

        if (!mockData) {
          // No assessment found - redirect to account setup or bank connection
          navigate('/account-setup');
          return;
        }

        setAssessment(mockData);
        setActiveTab('overview');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load assessment';
        setError(message);
        console.error('Failed to load assessment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [navigate]);

  return {
    assessment,
    activeTab,
    setActiveTab,
    isLoading,
    error,
  };
}
