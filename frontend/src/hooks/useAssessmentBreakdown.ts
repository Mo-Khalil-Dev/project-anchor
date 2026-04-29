/**
 * useAssessmentBreakdown Hook
 *
 * Fetches latest assessment via assessmentService.getCurrent().
 * Falls back to MOCK_ASSESSMENT_DETAILED if VITE_USE_MOCK_ASSESSMENT=true
 * or if backend is unreachable in development.
 *
 * Redirects to /account-setup if no assessment exists.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AssessmentDetailedDTO } from '../types';
import { MOCK_ASSESSMENT_DETAILED } from '../mocks/assessmentMockData';
import { assessmentService } from '../services/assessmentService';

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
  const [assessment, setAssessment] = useState<AssessmentDetailedDTO | null>(null);
  const [activeTab, setActiveTab] = useState<AssessmentTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (USE_MOCK) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setAssessment(MOCK_ASSESSMENT_DETAILED);
          return;
        }

        const data = await assessmentService.getCurrent();
        setAssessment(data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          navigate('/account-setup');
          return;
        }
        // Dev fallback: if backend unavailable, show mock so the UI is testable
        if (import.meta.env.DEV) {
          console.warn('Assessment API unavailable, using mock data:', err?.message);
          setAssessment(MOCK_ASSESSMENT_DETAILED);
          return;
        }
        const message = err instanceof Error ? err.message : 'Failed to load assessment';
        setError(message);
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
