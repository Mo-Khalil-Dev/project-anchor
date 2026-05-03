import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { useNavigate } from 'react-router-dom';
import { setSelectedPlan } from '@/store/slices/customerSlice';

export function useAggressivePlanDetail() {
  const [confirmed, setConfirmed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSelectPlan = useCallback(() => {
    if (!confirmed) return; // Should be disabled in UI anyway
    dispatch(setSelectedPlan('aggressive'));
    navigate('/payment-plans/terms');
  }, [confirmed, dispatch, navigate]);

  const handleSwitchToConservative = useCallback(() => {
    dispatch(setSelectedPlan('conservative'));
    navigate('/payment-plans/terms');
  }, [dispatch, navigate]);

  return {
    confirmed,
    setConfirmed,
    handleSelectPlan,
    handleSwitchToConservative,
  };
}
