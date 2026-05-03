import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { paymentService } from '@/services/paymentService';

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleConfirm = useCallback(async () => {
    if (!isComplete() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const { authorizationUrl } = await paymentService.initiateDirectDebit({
        accountHolderName: form.accountHolderName.trim(),
      });
      // Redirect to GoCardless hosted authorization page
      window.location.href = authorizationUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate Direct Debit setup';
      setError(message);
      setSubmitting(false);
    }
  }, [isComplete, submitting, form.accountHolderName]);

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
    submitting,
    error,
    handleConfirm,
    handleBack,
    selectedPlan,
  };
}
