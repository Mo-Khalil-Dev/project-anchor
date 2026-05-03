import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface FormData {
  accountHolderName: string;
  sortCode: string;
  accountNumber: string;
}

const PAYMENT_DAYS = [1, 5, 8, 10, 12, 15, 17, 20, 22, 25, 28];

export function useDirectDebitSetup() {
  const navigate = useNavigate();
  const selectedPlan = useSelector((state: any) => state.customer.selectedPlan);

  const [form, setForm] = useState<FormData>({
    accountHolderName: '',
    sortCode: '',
    accountNumber: '',
  });

  const [paymentDay, setPaymentDay] = useState(15);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    if (field === 'sortCode') {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      const formatted = cleaned.replace(/(\d{2})(?=\d)/g, '$1-');
      setForm(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'accountNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 8);
      setForm(prev => ({ ...prev, [field]: cleaned }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const isComplete = useCallback(() => {
    const sortCodeDigits = form.sortCode.replace(/\D/g, '').length === 6;
    const accountDigits = form.accountNumber.replace(/\D/g, '').length === 8;
    const nameValid = form.accountHolderName.trim().length > 2;
    return sortCodeDigits && accountDigits && nameValid;
  }, [form]);

  const handleConfirm = useCallback(() => {
    if (!isComplete()) return;
    // TODO: Call backend with form data + paymentDay to initiate GC flow
    // For now, navigate to confirmation (Phase 2)
    navigate('/payment-plans/confirmation', { replace: true });
  }, [isComplete, navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    form,
    updateField,
    paymentDay,
    setPaymentDay,
    isComplete: isComplete(),
    paymentDays: PAYMENT_DAYS,
    handleConfirm,
    handleBack,
    selectedPlan,
  };
}
