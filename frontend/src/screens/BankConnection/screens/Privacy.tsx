import { useState } from 'react';
import { useAppDispatch } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useBankConnection } from '../hooks/useBankConnection';

export function Privacy() {
  const dispatch = useAppDispatch();
  const { initiateBank } = useBankConnection();
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    dispatch(setBankJourneyState('intro'));
  };

  const handleConnectTink = async () => {
    setIsLoading(true);
    try {
      await initiateBank();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerLayout currentStep={2} totalSteps={4}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page {
          animation: fadeUp 0.22s ease both;
        }

        .page-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .page-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.7px;
          color: #0d0f14;
        }

        .page-subtitle {
          font-size: 14px;
          font-weight: 400;
          color: #5a5f72;
          line-height: 1.55;
          margin: 0;
        }

        .info-card {
          border-radius: 14px;
          padding: 20px;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .info-card-icon {
          font-size: 24px;
          color: #5b5bd6;
        }

        .info-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #0d0f14;
          margin: 0;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          font-size: 13px;
          color: #0d0f14;
          line-height: 1.5;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .retention-card {
          border-radius: 14px;
          padding: 16px;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          font-size: 13px;
          color: #0d0f14;
          line-height: 1.6;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .retention-label {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .consent-card {
          border-radius: 14px;
          padding: 20px;
          background-color: #f0f0ff;
          border: 2px solid #5b5bd6;
          margin-bottom: 24px;
        }

        .consent-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .consent-checkbox {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          flex-shrink: 0;
          accent-color: #5b5bd6;
        }

        .consent-text {
          font-size: 13px;
          color: #0d0f14;
          font-weight: 400;
          line-height: 1.6;
          margin: 0;
        }

        .buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .buttons {
            flex-direction: row;
          }

          .buttons > button {
            flex: 1;
          }
        }
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Your Privacy Matters</h1>
          <p className="page-subtitle">Your data is protected with industry-leading security</p>
        </div>

        {/* Security Details */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-card-icon">🛡️</div>
            <h2 className="info-card-title">Security Details</h2>
          </div>
          {[
            { icon: '🔒', text: 'Encrypted connection via 256-bit SSL' },
            { icon: '🚫', text: 'Your passwords are never stored by Bridge' },
            { icon: '🤝', text: 'Powered by Tink, an industry-leading security partner' },
            { icon: '✓', text: 'FCA regulated and compliant with UK financial standards' },
          ].map((item) => (
            <div key={item.text} className="info-row">
              <div className="info-icon">{item.icon}</div>
              <div>{item.text}</div>
            </div>
          ))}
        </div>

        {/* Data Usage */}
        <div className="info-card">
          <h2 className="info-card-title" style={{ marginBottom: '12px', marginTop: 0 }}>
            How We Use Your Data
          </h2>
          {[
            { icon: '✓', text: 'Used to calculate your financial hardship level' },
            { icon: '✓', text: 'Used to create personalised payment plans' },
            { icon: '✓', text: 'Reviewed by compliance team to prevent discrimination' },
            { icon: '✗', text: 'Never sold or shared with third parties' },
            { icon: '✗', text: 'Never used for marketing or targeting' },
          ].map((item) => (
            <div key={item.text} className="info-row">
              <div className="info-icon">{item.icon}</div>
              <div>{item.text}</div>
            </div>
          ))}
        </div>

        {/* Data Retention */}
        <div className="retention-card">
          <div className="retention-label">Data Retention (FCA Requirement)</div>
          <div>We keep your financial data for 3 years for regulatory compliance.</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>
            Want to delete your data?{' '}
            <a href="mailto:privacy@bridge.com" style={{ color: 'var(--accent)' }}>
              Contact us
            </a>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="consent-card">
          <label className="consent-label">
            <input
              type="checkbox"
              className="consent-checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            />
            <p className="consent-text">
              I understand Bridge will connect my bank account and analyse my financial data to
              assess hardship and create payment plans. I can revoke this access at any time in
              Settings.
            </p>
          </label>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <Button
            onClick={handleConnectTink}
            disabled={!consentChecked || isLoading}
            isLoading={isLoading}
          >
            Connect with Tink
          </Button>
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
