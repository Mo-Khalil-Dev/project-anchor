import { useAppDispatch, useAppSelector } from '@/store';
import { setBankJourneyState, resetBankJourney } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { AlertTriangleIcon } from '@/components/core/icons';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

export function Error() {
  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.customer.bankError);

  const handleTryAgain = () => {
    dispatch(setBankJourneyState('privacy'));
  };

  const handleProvideManually = () => {
    // TODO: Navigate to manual statement upload in Phase 2
    dispatch(resetBankJourney());
  };

  const handleGetHelp = () => {
    // TODO: Open support chat or navigate to help page
  };

  const errorCode = error?.code || 'TINK_AUTH_FAILED_001';
  const timestamp = error?.timestamp || new Date().toISOString();

  return (
    <CustomerLayout currentStep={4} totalSteps={4}>
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
          padding: 52px 40px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .alert-icon {
          width: 84px;
          height: 84px;
          background-color: #fee;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .alert-svg {
          width: 40px;
          height: 40px;
        }

        .heading {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0d0f14;
          letter-spacing: -0.6px;
        }

        .subheading {
          font-size: 14.5px;
          color: #5a5f72;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .error-reasons-card {
          background: #fee;
          border: 1px solid rgba(192, 57, 43, 0.15);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 20px;
          text-align: left;
        }

        .error-reasons-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #c0392b;
          margin-bottom: 10px;
        }

        .error-reason {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 13.5px;
          color: #5a5f72;
          padding: 5px 0;
        }

        .error-reason-bullet {
          color: #c0392b;
          font-weight: 700;
          line-height: 1.4;
          flex-shrink: 0;
        }

        .error-code-box {
          background: #f5f5f5;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-family: monospace;
          font-size: 12px;
          color: #5a5f72;
          text-align: left;
        }

        .buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
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
        <div className="card">
          <div className="alert-icon">
            <AlertTriangleIcon className="alert-svg" />
          </div>
          <h2 className="heading">Connection Failed</h2>
          <p className="subheading">
            We couldn't connect to your bank. Don't worry — your data is safe.
          </p>
          <div className="error-reasons-card">
            <div className="error-reasons-title">Why this might happen:</div>
            {[
              'Your bank login details were incorrect',
              'Your bank\'s service was temporarily unavailable',
              'You cancelled the connection during login',
              'Your bank may not yet support Open Banking',
            ].map((reason) => (
              <div key={reason} className="error-reason">
                <span className="error-reason-bullet">·</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
          <div className="error-code-box">
            Error: {errorCode} · {new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19)} UTC
          </div>
          <div className="buttons">
            <Button onClick={handleTryAgain}>Try Again</Button>
            <Button variant="secondary" onClick={handleProvideManually}>
              Provide Statements Manually
            </Button>
            <Button variant="ghost" onClick={handleGetHelp}>
              Get Help
            </Button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
