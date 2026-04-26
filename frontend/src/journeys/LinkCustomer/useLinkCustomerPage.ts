import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function useLinkCustomerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLinkCustomer = useCallback(async (customerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customers/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to link customer');
      }

      navigate('/assessment', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link customer');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return {
    user,
    isLoading,
    error,
    handleLinkCustomer,
    handleCancel,
  };
}
