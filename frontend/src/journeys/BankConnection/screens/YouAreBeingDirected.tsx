import { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { ClockSpinnerIcon } from '@/components/core/icons';
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
        }

        .card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 52px 40px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .spinner {
          width: 72px;
          height: 72px;
          background-color: #f0f0ff;
          border: 2px solid rgba(91, 91, 214, 0.15);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .spinner-svg {
          width: 36px;
          height: 36px;
          animation: spinHG 3s linear infinite;
        }

        .heading {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0d0f14;
          letter-spacing: -0.5px;
        }

        .description {
          font-size: 14px;
          color: #5a5f72;
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }

        .trust-badges {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .trust-badge {
          font-size: 12.5px;
          font-weight: 600;
          color: #5b5bd6;
          background: #f0f0ff;
          border-radius: 100px;
          padding: 5px 12px;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="spinner">
            <ClockSpinnerIcon className="spinner-svg" />
          </div>
          <h2 className="heading">Opening Tink…</h2>
          <p className="description">
            You're being securely redirected to <strong style={{color:'#0d0f14'}}>Tink</strong>, our FCA-regulated Open Banking partner. Select your bank and log in there — we never see your credentials.
          </p>
          <div className="trust-badges">
            <div className="trust-badge">FCA regulated</div>
            <div className="trust-badge">256-bit encryption</div>
            <div className="trust-badge">Read-only access</div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
