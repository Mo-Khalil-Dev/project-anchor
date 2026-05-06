import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

const Bridge = {
  text: '#0d0f14',
  sub: '#5a5f72',
  accent: 'oklch(52% 0.18 270)',
};

export function DirectDebitCallbackScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Extract billing request ID from query params (GC passes it as 'state' or 'billing_request_id')
    const billingRequestId = searchParams.get('state') || searchParams.get('billing_request_id');

    if (billingRequestId) {
      // Store for later reference if needed
      sessionStorage.setItem('gocardlessBillingRequestId', billingRequestId);
    }

    // Navigate to holding screen where we'll poll for mandate status
    navigate('/payment-plans/direct-debit/holding', { replace: true });
  }, [searchParams, navigate]);

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: Bridge.text, margin: 0, marginBottom: 8 }}>
          Processing authorization
        </h1>
        <p style={{ fontSize: 15, color: Bridge.sub, margin: 0, lineHeight: 1.6 }}>
          Please wait while we confirm your Direct Debit setup...
        </p>
        <div style={{ marginTop: 32, marginBottom: 24, paddingTop: 24 }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: '0 auto',
              borderRadius: '50%',
              border: `4px solid ${Bridge.accent}20`,
              borderTop: `4px solid ${Bridge.accent}`,
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </CustomerLayout>
  );
}
