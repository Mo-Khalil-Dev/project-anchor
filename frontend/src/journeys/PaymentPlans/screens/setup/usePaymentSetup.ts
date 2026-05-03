import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type PaymentMethod = 'dd' | 'card' | 'cash';

export function usePaymentSetup() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PaymentMethod>('dd');

  const handleContinue = () => {
    if (selected === 'dd') {
      navigate('/payment-plans/direct-debit', { replace: true });
    } else {
      // TODO: Phase 2+ implement card/cash flows
      console.warn(`${selected} payment method not yet implemented`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return {
    selected,
    setSelected,
    handleContinue,
    handleBack,
  };
}
