import { useAppDispatch, useAppSelector } from '@/store';
import { setBankJourneyState, resetBankJourney } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { ErrorReasons } from '../components/ErrorReasons';

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

  const errorCode = error?.code || 'UNKNOWN_ERROR';
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
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .alert-icon {
          width: 84px;
          height: 84px;
          background-color: var(--red);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .alert-svg {
          width: 48px;
          height: 48px;
          color: white;
        }

        .heading {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0d0f14;
          letter-spacing: -0.6px;
        }

        .subheading {
          font-size: 14px;
          color: #5a5f72;
          line-height: 1.6;
          margin: 0 0 24px 0;
          max-width: 400px;
        }

        .error-code-box {
          background-color: #f4f5f9;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 10px;
          padding: 12px;
          margin: 24px 0;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #9197ab;
          line-height: 1.6;
          word-break: break-all;
        }

        .error-reasons {
          width: 100%;
          max-width: 400px;
          margin-bottom: 24px;
        }

        .buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        @media (min-width: 640px) {
          .buttons {
            flex-direction: row;
          }

          .buttons > button {
            flex: 1;
          }
        }

        .button-secondary {
          order: 2;
        }

        .button-tertiary {
          order: 3;
        }

        @media (min-width: 640px) {
          .button-secondary {
            order: initial;
          }

          .button-tertiary {
            order: initial;
          }
        }
      `}</style>

      <div className="page">
        <div className="alert-icon">
          <svg className="alert-svg" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="white"
            />
          </svg>
        </div>

        <h1 className="heading">Connection Failed</h1>
        <p className="subheading">
          We couldn't connect to your bank. Don't worry — your data is safe.
        </p>

        <div className="error-reasons">
          <ErrorReasons />
        </div>

        <div className="error-code-box">
          Error: {errorCode} · {new Date(timestamp).toUTCString()}
        </div>

        <div className="buttons">
          <Button onClick={handleTryAgain}>Try Again</Button>
          <Button variant="secondary" onClick={handleProvideManually} className="button-secondary">
            Provide Statements Manually
          </Button>
          <Button variant="ghost" onClick={handleGetHelp} className="button-tertiary">
            Get Help
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
