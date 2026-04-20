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

        .card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.6px;
          color: #0d0f14;
        }

        .page-subtitle {
          font-size: 14.5px;
          font-weight: 400;
          color: #5a5f72;
          line-height: 1.55;
          margin: 0;
        }

        .info-card {
          padding: 20px 22px;
          margin-bottom: 12px;
        }

        .info-card-header {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }

        .info-card-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f0f0ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #0d0f14;
          margin: 0;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row-key {
          font-size: 13.5px;
          color: #5a5f72;
          font-weight: 600;
        }

        .info-row-value {
          font-size: 13px;
          color: #5a5f72;
          line-height: 1.5;
          text-align: right;
        }

        .section-label {
          color: #9197ab;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .check-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          font-size: 13px;
          color: #0d0f14;
          line-height: 1.5;
        }

        .check-row:last-child {
          border-bottom: none;
        }

        .check-icon {
          color: #1e7d3f;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .x-icon {
          color: #c0392b;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .retention-card {
          padding: 18px 20px;
          margin-bottom: 12px;
        }

        .retention-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9197ab;
          margin-bottom: 12px;
        }

        .retention-text {
          font-size: 13.5px;
          color: #5a5f72;
          line-height: 1.6;
          margin: 0;
        }

        .retention-link {
          color: #5b5bd6;
        }

        .consent-card {
          padding: 20px 22px;
          margin-bottom: 24px;
          background: #f0f0ff;
          border: 1.5px solid rgba(91, 91, 214, 0.15);
        }

        .consent-label {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          cursor: pointer;
        }

        .consent-checkbox {
          width: 18px;
          height: 18px;
          margin-top: 2px;
          cursor: pointer;
          flex-shrink: 0;
          accent-color: #5b5bd6;
        }

        .consent-text-wrapper {
          flex: 1;
        }

        .consent-title {
          font-size: 14px;
          font-weight: 600;
          color: #0d0f14;
          margin: 0 0 4px 0;
        }

        .consent-desc {
          font-size: 13px;
          color: #5a5f72;
          line-height: 1.55;
          margin: 0;
        }

        .buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .buttons {
            grid-template-columns: 1fr;
          }

          .info-row {
            grid-template-columns: 1fr;
          }

          .info-row-value {
            text-align: left;
          }
        }
      `}</style>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Your Privacy Matters</h1>
          <p className="page-subtitle">Before connecting, here's exactly how we handle your data.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4 }}>
          {/* Security Details */}
          <div className="card info-card">
            <div className="info-card-header">
              <div className="info-card-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L3 5v5c0 3.3 2.7 6.4 6 7 3.3-.6 6-3.7 6-7V5L9 2z" stroke="#5b5bd6" strokeWidth="1.6" fill="#f0f0ff" strokeLinejoin="round"/>
                  <path d="M6 9l2 2 4-4" stroke="#5b5bd6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="info-card-title">Your data is secure</div>
            </div>
            <div className="info-row">
              <div className="info-row-key">Encrypted connection</div>
              <div className="info-row-value">All data is encrypted end-to-end using 256-bit TLS.</div>
            </div>
            <div className="info-row">
              <div className="info-row-key">No passwords stored</div>
              <div className="info-row-value">We never see or store your bank login credentials.</div>
            </div>
            <div className="info-row">
              <div className="info-row-key">Tink partnership</div>
              <div className="info-row-value">Powered by Tink — a regulated UK Open Banking provider.</div>
            </div>
            <div className="info-row">
              <div className="info-row-key">FCA regulated</div>
              <div className="info-row-value">Bridge complies with all FCA and Ofgem financial regulations.</div>
            </div>
          </div>

          {/* Data Usage */}
          <div className="card info-card">
            <div className="section-label">How we use your data</div>
            <div className="check-row">
              <span className="check-icon">✓</span>
              <span>Assess your affordability for a payment plan</span>
            </div>
            <div className="check-row">
              <span className="check-icon">✓</span>
              <span>Detect if you're in financial hardship</span>
            </div>
            <div className="check-row">
              <span className="check-icon">✓</span>
              <span>Recommend personalised support services</span>
            </div>
            <div className="check-row">
              <span className="x-icon">✕</span>
              <span>We will never share your data with third parties without consent</span>
            </div>
            <div className="check-row">
              <span className="x-icon">✕</span>
              <span>We will never use your data for marketing purposes</span>
            </div>
          </div>

          {/* Data Retention */}
          <div className="card retention-card">
            <div className="retention-label">Data retention</div>
            <div className="retention-text">
              We keep your transaction data for <strong style={{ color: '#0d0f14' }}>3 years</strong> (required by FCA regulations). You can request deletion at any time under your GDPR right to be forgotten. Contact us at <span className="retention-link">privacy@bridge.co.uk</span>
            </div>
          </div>

          {/* Consent Card */}
          <div className="card consent-card">
            <label className="consent-label">
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <div className="consent-text-wrapper">
                <div className="consent-title">I consent to connecting my bank account</div>
                <div className="consent-desc">
                  I understand that Bridge will connect to my bank via Tink to assess my financial situation. I can revoke access at any time in Settings.
                </div>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="buttons">
            <Button onClick={handleConnectTink} disabled={!consentChecked || isLoading} isLoading={isLoading}>
              Connect with Tink
            </Button>
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
