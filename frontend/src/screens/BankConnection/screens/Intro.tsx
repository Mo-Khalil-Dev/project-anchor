import { useAppDispatch } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

export function Intro() {
  const dispatch = useAppDispatch();

  const handleContinue = () => {
    dispatch(setBankJourneyState('privacy'));
  };

  const handleProvideManually = () => {
    // TODO: Navigate to manual statement upload in Phase 2
  };

  return (
    <CustomerLayout currentStep={1} totalSteps={4}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page {
          animation: fadeUp 0.22s ease both;
        }

        .gradient-hero {
          background: linear-gradient(135deg, #5b5bd6 0%, #3d3aa8 100%);
          border-radius: 18px;
          padding: 52px 40px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .gradient-hero::before {
          content: '';
          position: absolute;
          width: 280px;
          height: 280px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          top: -80px;
          right: -60px;
        }

        .gradient-hero::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          bottom: -60px;
          left: -40px;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .hero-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 12px 0;
          letter-spacing: -0.7px;
          color: white;
        }

        .hero-subtitle {
          font-size: 14px;
          font-weight: 400;
          line-height: 1.55;
          margin: 0;
          color: rgba(255, 255, 255, 0.95);
        }

        .value-props {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }

        .value-prop {
          text-align: center;
          padding: 16px;
        }

        .value-prop-icon {
          font-size: 28px;
          margin-bottom: 8px;
          color: #1e7d3f;
        }

        .value-prop-text {
          font-size: 13px;
          font-weight: 400;
          color: #0d0f14;
          line-height: 1.5;
        }

        .access-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .access-card {
          border-radius: 14px;
          padding: 20px;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .access-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #0d0f14;
        }

        .access-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 13px;
          color: #0d0f14;
          line-height: 1.5;
        }

        .access-item:last-child {
          margin-bottom: 0;
        }

        .access-icon {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        @media (min-width: 640px) {
          .buttons {
            flex-direction: row;
          }

          .buttons > button {
            flex: 1;
          }
        }

        .trust-text {
          text-align: center;
          font-size: 13px;
          color: #9197ab;
          font-weight: 400;
          line-height: 1.6;
        }
      `}</style>

      <div className="page">
        {/* Hero Section */}
        <div className="gradient-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="36" cy="36" r="32" stroke="white" strokeWidth="1.5" opacity="0.5" />
                <path
                  d="M28 42C28 42 32 38 36 40C40 42 44 30 48 36"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="26" y="50" width="20" height="8" rx="1" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <h1 className="hero-title">Connect Your Bank Account</h1>
            <p className="hero-subtitle">
              Securely link your bank for instant financial insights
            </p>
          </div>
        </div>

        {/* Value Props */}
        <div className="value-props">
          {[
            'No forms to fill out',
            'Faster assessment',
            'Better support options',
          ].map((prop) => (
            <div key={prop} className="value-prop">
              <div className="value-prop-icon">✓</div>
              <div className="value-prop-text">{prop}</div>
            </div>
          ))}
        </div>

        {/* Access Cards */}
        <div className="access-grid">
          <div className="access-card">
            <h3 className="access-title">We'll access:</h3>
            {['Last 6 months of transactions', 'Income & salary deposits', 'Spending patterns'].map(
              (item) => (
                <div key={item} className="access-item">
                  <span className="access-icon">✓</span>
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
          <div className="access-card">
            <h3 className="access-title">We won't access:</h3>
            {['Login credentials', 'Money movement ability', 'Account details changes'].map(
              (item) => (
                <div key={item} className="access-item">
                  <span className="access-icon">✗</span>
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <Button onClick={handleContinue}>Continue</Button>
          <Button variant="secondary" onClick={handleProvideManually}>
            Provide Statements Manually
          </Button>
        </div>

        {/* Trust Footer */}
        <div className="trust-text">
          🔒 256-bit encryption · Read-only · FCA regulated · GDPR compliant
        </div>
      </div>
    </CustomerLayout>
  );
}
