import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useMandatePolling } from './useMandatePolling';

const Bridge = {
  text: '#0d0f14',
  sub: '#5a5f72',
  muted: '#9197ab',
  accent: 'oklch(52% 0.18 270)',
  bg: '#f4f5f9',
  border: 'rgba(0,0,0,0.08)',
};

export function DirectDebitHoldingScreen() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const { mandateStatus, isPolling, error } = useMandatePolling(true);

  // Timer for display
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-navigate when mandate is created
  useEffect(() => {
    if (mandateStatus === 'CREATED' || mandateStatus === 'ACTIVE') {
      navigate('/payment-plans/direct-debit/success');
    }
  }, [mandateStatus, navigate]);

  // Show error state
  if (error) {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#b91c1c', margin: 0, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: Bridge.sub, margin: 0, marginBottom: 24, lineHeight: 1.6 }}>
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: Bridge.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to setup
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: Bridge.text, margin: 0, marginBottom: 8 }}>
            Authorizing your payment
          </h1>
          <p style={{ fontSize: 15, color: Bridge.sub, margin: 0, lineHeight: 1.6 }}>
            We're waiting for GoCardless to confirm your Direct Debit mandate. This usually takes a few seconds.
          </p>
        </div>

        {/* Loading spinner */}
        <div style={{ marginBottom: 32, paddingTop: 24 }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: '0 auto',
              borderRadius: '50%',
              border: `4px solid ${Bridge.border}`,
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

        {/* Status message */}
        <div
          style={{
            background: Bridge.bg,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            fontSize: 13.5,
            color: Bridge.sub,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: Bridge.text, display: 'block', marginBottom: 4 }}>
            What's happening?
          </strong>
          <div style={{ textAlign: 'left', display: 'inline-block' }}>
            <div style={{ marginBottom: 8, paddingLeft: 20, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>✓</span>
              You've authorized the Direct Debit mandate with GoCardless
            </div>
            <div style={{ color: Bridge.text, fontWeight: 600, paddingLeft: 20, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>⏳</span>
              Confirming with your bank... {!isPolling && `(${mandateStatus})`}
            </div>
          </div>
        </div>

        {/* Elapsed time */}
        <p style={{ fontSize: 12, color: Bridge.muted, margin: 0 }}>
          Checking status every 5 seconds... ({seconds}s elapsed)
        </p>

        {/* Info */}
        <div
          style={{
            background: 'oklch(96.5% 0.04 145)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'oklch(38% 0.17 145)',
            marginTop: 24,
            lineHeight: 1.5,
          }}
        >
          🔒 Your bank details are secure. GoCardless uses industry-standard encryption.
        </div>
      </div>
    </CustomerLayout>
  );
}
