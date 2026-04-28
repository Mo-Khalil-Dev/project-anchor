import { useCallback, useState } from 'react';
import { customerService, LinkUserToCustomerInput, LinkUserToCustomerResponse } from '@/services/customerService';

export interface LinkCustomerResult {
  data: LinkUserToCustomerResponse | null;
  error: string | null;
}

export interface UseCustomerSetupReturn {
  loading: boolean;
  customer: LinkUserToCustomerResponse | null;
  linkCustomer: (input: LinkUserToCustomerInput) => Promise<LinkCustomerResult>;
}

/**
 * useCustomerSetup Hook
 *
 * Manages the customer setup flow — linking an authenticated user to a customer
 * by submitting utility account details.
 *
 * Returns the error directly in the result object (not via React state) so
 * callers don't risk reading stale state after an async call.
 *
 * Usage:
 * const { loading, linkCustomer } = useCustomerSetup();
 *
 * const handleSubmit = async (details) => {
 *   const { data, error } = await linkCustomer(details);
 *   if (data) { // success }
 *   if (error) { // show error }
 * };
 */
export function useCustomerSetup(): UseCustomerSetupReturn {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<LinkUserToCustomerResponse | null>(null);

  const linkCustomer = useCallback(
    async (input: LinkUserToCustomerInput): Promise<LinkCustomerResult> => {
      setLoading(true);

      try {
        const result = await customerService.linkUserToCustomer(input);
        setCustomer(result);
        return { data: result, error: null };
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to link customer. Please try again.';
        return { data: null, error };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, customer, linkCustomer };
}
