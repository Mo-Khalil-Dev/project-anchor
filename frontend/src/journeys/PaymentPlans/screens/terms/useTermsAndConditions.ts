import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useTermsAndConditions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = useCallback(() => {
    if (!agreed) return;
    // TODO: Call backend to confirm payment plan acceptance
    navigate('/assessment', { replace: true });
  }, [agreed, navigate]);

  const handleBack = useCallback(() => {
    navigate('/payment-plans', { replace: true });
  }, [navigate]);

  return {
    agreed,
    setAgreed,
    handleConfirm,
    handleBack,
  };
}
