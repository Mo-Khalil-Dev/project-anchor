import { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

export function YouAreBeingDirected() {
  const authUrl = useAppSelector((s) => s.customer.bankConnectionData?.authUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authUrl) {
        window.location.href = authUrl;
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [authUrl]);

  return (
    <CustomerLayout currentStep={3} totalSteps={4}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spinHG {
          0%, 45% { transform: rotate(0deg); }
          55%, 100% { transform: rotate(180deg); }
        }

        .page {
          animation: fadeUp 0.22s ease both;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .hourglass-icon {
          width: 72px;
          height: 72px;
          margin-bottom: 24px;
          background-color: #5b5bd6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: spinHG 3s linear infinite;
        }

        .hourglass-svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .heading {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 12px 0;
          color: #0d0f14;
          letter-spacing: -0.5px;
        }

        .description {
          font-size: 14px;
          color: #5a5f72;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 400px;
        }

        .trust-badges {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background-color: #f0f0ff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          font-size: 12px;
          color: #0d0f14;
          font-weight: 500;
        }
      `}</style>

      <div className="page">
        <div className="hourglass-icon">
          <svg className="hourglass-svg" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 2h12v7c0 2-1.5 3-3 3s-3 1-3 3 1.5 3 3 3 3 1 3 3v7H6v-7c0-2 1.5-3 3-3s3-1 3-3-1.5-3-3-3-3 1-3 3V2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <h1 className="heading">Opening Tink…</h1>

        <p className="description">
          You'll be securely redirected to Tink to connect your bank. You'll log in there directly
          — Bridge never sees your credentials.
        </p>

        <div className="trust-badges">
          <div className="badge">
            <span>✓</span> FCA regulated
          </div>
          <div className="badge">
            <span>🔒</span> 256-bit encryption
          </div>
          <div className="badge">
            <span>👁️</span> Read-only access
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
