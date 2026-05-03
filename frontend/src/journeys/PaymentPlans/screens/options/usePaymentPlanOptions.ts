import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import type { AssessmentDetailedDTO } from '@/types';
import { setSelectedPlan } from '@/store/slices/customerSlice';

export const PROS: Record<string, string[]> = {
  Conservative: [
    'Leaves the most monthly buffer for emergencies',
    'Lowest monthly commitment',
    'Highest chance of completing the plan',
  ],
  Balanced: [
    'Clears debt sooner',
    'Moderate risk if unexpected expense',
    'Reasonable monthly buffer remains',
  ],
  Aggressive: [
    'Clears debt fastest',
    'Saves on any interest accumulation',
  ],
};

export const COLORS: Record<string, { text: string; bg: string; ring: string; border: string }> = {
  Conservative: { text: 'text-green', bg: 'bg-green', ring: 'oklch(51% 0.17 145)', border: 'border-green' },
  Balanced: { text: 'text-amber', bg: 'bg-amber', ring: 'oklch(62% 0.16 76)', border: 'border-amber' },
  Aggressive: { text: 'text-red', bg: 'bg-red', ring: 'oklch(52% 0.18 25)', border: 'border-red' },
};

export function usePaymentPlanOptions(assessment: AssessmentDetailedDTO) {
  const [selectedType, setSelectedType] = useState<string>('Conservative');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const recommendedPlan = assessment.paymentPlans.find(p => p.sustainability === 'HIGH')?.type || 'Conservative';

  const selectedPlan = assessment.paymentPlans.find(p => p.type === selectedType);
  const monthlyBuffer = selectedPlan ? assessment.disposableIncome - selectedPlan.monthlyAmount : 0;

  const handleContinue = useCallback(() => {
    const planType = selectedType.toLowerCase() as 'conservative' | 'balanced' | 'aggressive';
    console.log('[DEBUG] Dispatching setSelectedPlan with:', planType);
    dispatch(setSelectedPlan(planType));
    console.log('[DEBUG] Navigating to /payment-plans/terms');
    navigate('/payment-plans/terms');
  }, [selectedType, dispatch, navigate]);

  const handleCompare = useCallback(() => {
    const planSlug = selectedType.toLowerCase();
    navigate(`/payment-plans/${planSlug}`);
  }, [selectedType, navigate]);

  return {
    selectedType,
    setSelectedType,
    recommendedPlan,
    selectedPlan,
    monthlyBuffer,
    handleContinue,
    handleCompare,
  };
}
