import { useState, useCallback } from 'react';
import type { AssessmentDetailedDTO } from '../../types';

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
  const recommendedPlan = assessment.paymentPlans.find(p => p.sustainability === 'HIGH')?.type || 'Conservative';

  const selectedPlan = assessment.paymentPlans.find(p => p.type === selectedType);
  const monthlyBuffer = selectedPlan ? assessment.disposableIncome - selectedPlan.monthlyAmount : 0;

  const handleContinue = useCallback(() => {
    // TODO: Phase 2 — Send selected plan to backend, navigate to acceptance/confirmation
    console.log('Selected plan:', selectedType);
    // For now, just alert
    alert(`You've selected the ${selectedType} Plan (£${selectedPlan?.monthlyAmount}/month for ${selectedPlan?.duration} months). Plan submission coming soon.`);
  }, [selectedType, selectedPlan]);

  const handleCompare = useCallback(() => {
    // TODO: Phase 2 — Open detailed comparison modal or navigate to comparison page
    console.log('Comparing plans');
    alert('Detailed comparison view coming soon.');
  }, []);

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
