import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { SummaryGrid } from '../components/SummaryGrid';

export function Success() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.customer.bankConnectionData);

  const handleViewAssessment = () => {
    dispatch(setCurrentStep('assessment'));
    navigate('/assessment');
  };

  const summaryItems = [
    { label: 'Bank', value: data?.bankName || 'Connected' },
    { label: 'Transactions', value: data?.transactions || '6 months' },
    { label: 'Monthly Income', value: `£${data?.monthlyIncome || '1,850'}` },
    { label: 'Avg. Monthly Spend', value: `£${data?.avgMonthlySpend || '1,720'}` },
  ];

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

        .checkmark-icon {
          width: 84px;
          height: 84px;
          background-color: var(--green);
          border: 3px solid var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .checkmark-svg {
          width: 48px;
          height: 48px;
          color: white;
        }

        .heading {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0d0f14;
          letter-spacing: -0.7px;
        }

        .subheading {
          font-size: 14px;
          color: #5a5f72;
          line-height: 1.6;
          margin: 0 0 28px 0;
          max-width: 400px;
        }

        .summary-grid {
          width: 100%;
          margin-bottom: 28px;
        }

        .button-container {
          margin-bottom: 24px;
        }

        .footer {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }
      `}</style>

      <div className="page">
        <div className="checkmark-icon">
          <svg className="checkmark-svg" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              fill="white"
            />
          </svg>
        </div>

        <h1 className="heading">Bank Connected!</h1>
        <p className="subheading">
          Your {data?.bankName || 'bank account'} is connected. We're now analysing your
          financial data.
        </p>

        <div className="summary-grid">
          <SummaryGrid items={summaryItems} />
        </div>

        <div className="button-container">
          <Button onClick={handleViewAssessment}>View Full Assessment</Button>
        </div>

        <div className="footer">
          🔒 Read-only connection · Manage in Settings · Revoke anytime
        </div>
      </div>
    </CustomerLayout>
  );
}
