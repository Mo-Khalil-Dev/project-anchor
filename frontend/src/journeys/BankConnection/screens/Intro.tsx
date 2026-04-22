import { useAppDispatch } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { BuildingIcon, CheckIcon, ShieldIcon } from '@/components/core/icons';
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

        .hero {
          background: linear-gradient(135deg, #5b5bd6 0%, #3d3aa8 100%);
          border-radius: 20px;
          padding: 52px 40px;
          margin-bottom: 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before,
        .hero::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .hero::before {
          width: 280px;
          height: 280px;
          top: -100px;
          right: -80px;
        }

        .hero::after {
          width: 200px;
          height: 200px;
          bottom: -60px;
          left: -40px;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-title {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 12px 0;
          letter-spacing: -0.7px;
        }

        .hero-subtitle {
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.6;
          margin: 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-label {
          color: #9197ab;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
          padding: 0 16px;
        }

        .value-props-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 4px 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .value-props-list {
          display: flex;
          flex-direction: column;
        }

        .value-prop {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        .value-prop:last-child {
          border-bottom: none;
        }

        .value-prop-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #f0f0ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .value-prop-text {
          flex: 1;
        }

        .value-prop-title {
          color: #0d0f14;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 3px 0;
        }

        .value-prop-desc {
          color: #5a5f72;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
        }

        .access-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .access-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .access-card-title {
          color: #9197ab;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 12px 0;
        }

        .access-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .access-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: #0d0f14;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
        }

        .access-item-icon {
          color: #1e7d3f;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .access-item-deny .access-item-icon {
          color: #c0392b;
        }

        .buttons-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 4px;
        }

        .trust-footer {
          text-align: center;
          color: #9197ab;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.6;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        @media (max-width: 640px) {
          .access-grid {
            grid-template-columns: 1fr;
          }

          .buttons-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        {/* Hero */}
        <div className="hero">
          <div className="hero-content">
            <div style={{ marginBottom: '20px' }}>
              <BuildingIcon />
            </div>
            <h1 className="hero-title">Connect Your Bank Account</h1>
            <p className="hero-subtitle">
              We use a secure, read-only connection to verify your finances — no manual forms, no passwords stored.
            </p>
          </div>
        </div>

        {/* Why Connect Card */}
        <div className="section-label">Why connect your bank?</div>
        <div className="value-props-card">
          <div className="value-props-list">
            {[
              { title: 'No forms to fill out', desc: 'We see your real spending patterns, not just what you tell us.' },
              { title: 'Faster assessment', desc: 'Complete your assessment in minutes, not days.' },
              { title: 'Better support options', desc: 'More tailored payment plans and support recommendations.' },
            ].map(({ title, desc }) => (
              <div key={title} className="value-prop">
                <div className="value-prop-icon">
                  <CheckIcon width={14} height={12} />
                </div>
                <div className="value-prop-text">
                  <div className="value-prop-title">{title}</div>
                  <div className="value-prop-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Access Cards */}
        <div className="access-grid">
          <div className="access-card">
            <div className="access-card-title">What we'll access</div>
            <div className="access-items">
              {['Last 6 months of transactions', 'Income & salary deposits', 'Spending patterns & categories'].map(
                (item) => (
                  <div key={item} className="access-item">
                    <span className="access-item-icon">✓</span>
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="access-card">
            <div className="access-card-title">What we won't access</div>
            <div className="access-items">
              {[
                'Your login password or credentials',
                'Ability to move or transfer money',
                'Ability to change account details',
              ].map((item) => (
                <div key={item} className="access-item access-item-deny">
                  <span className="access-item-icon">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="buttons-container">
          <Button onClick={handleContinue}>Continue</Button>
          <Button variant="secondary" onClick={handleProvideManually}>
            Provide Statements Manually
          </Button>
        </div>

        {/* Trust Footer */}
        <div className="trust-footer">
          <ShieldIcon />
          256-bit encryption · Read-only · FCA regulated · GDPR compliant
        </div>
      </div>
    </CustomerLayout>
  );
}
