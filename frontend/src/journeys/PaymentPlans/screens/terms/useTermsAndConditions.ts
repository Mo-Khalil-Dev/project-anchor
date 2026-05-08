import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { assessmentService, type PlanType } from '@/services/assessmentService';

const PLAN_TYPE_MAP: Record<string, PlanType> = {
  conservative: 'Conservative',
  balanced: 'Balanced',
  aggressive: 'Aggressive',
};

export function useTermsAndConditions() {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const selectedPlan = useSelector((state: any) => state.customer.selectedPlan);

  const handleConfirm = useCallback(async () => {
    if (!agreed || submitting) return;

    const planType = selectedPlan ? PLAN_TYPE_MAP[selectedPlan.toLowerCase()] : undefined;
    if (!planType) {
      setError('No plan selected');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await assessmentService.selectPlan({ planType });
      navigate('/payment-plans/payment-setup', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save plan selection';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [agreed, submitting, selectedPlan, navigate]);

  const handleBack = useCallback(() => {
    navigate('/payment-plans', { replace: true });
  }, [navigate]);

  return {
    agreed,
    setAgreed,
    submitting,
    error,
    handleConfirm,
    handleBack,
  };
}
