import { useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { useNavigate } from 'react-router-dom';
import { setSelectedPlan } from '@/store/slices/customerSlice';

export function useBalancedPlanDetail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSelectPlan = useCallback(() => {
    dispatch(setSelectedPlan('balanced'));
    navigate('/payment-plans/terms');
  }, [dispatch, navigate]);

  const handleBack = useCallback(() => {
    navigate('/payment-plans');
  }, [navigate]);

  return {
    handleSelectPlan,
    handleBack,
  };
}
