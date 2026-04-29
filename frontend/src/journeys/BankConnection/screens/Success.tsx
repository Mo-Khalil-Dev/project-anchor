import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { CheckmarkIcon } from '@/components/core/icons';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

export function Success() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.customer.bankConnectionData);

  const handleViewAssessment = () => {
    dispatch(setCurrentStep('assessment'));
    navigate('/assessment');
  };

  const summaryData = [
    { label: 'Bank', value: data?.bankName || 'Barclays' },
    { label: 'Transactions', value: data?.transactions || '6 months' },
    {
      label: 'Monthly Income',
      value: `£${(data?.totalIncome || data?.monthlyIncome || 1850).toLocaleString('en-GB', {
        maximumFractionDigits: 2,
      })}`,
    },
    {
      label: 'Avg. Monthly Spend',
      value: `£${(data?.totalExpenses || data?.avgMonthlySpend || 1720).toLocaleString('en-GB', {
        maximumFractionDigits: 2,
      })}`,
    },
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
        }

        .card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 52px 40px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .checkmark-icon {
          width: 84px;
          height: 84px;
          background-color: #e8f5e9;
          border: 3px solid #1e7d3f;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .checkmark-svg {
          width: 40px;
          height: 30px;
        }

        .heading {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0d0f14;
          letter-spacing: -0.7px;
        }

        .subheading {
          font-size: 14.5px;
          color: #5a5f72;
          line-height: 1.6;
          margin: 0 0 32px 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .summary-grid {
          background: #f5f5f5;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .summary-item {
          background: white;
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          text-align: left;
        }

        .summary-label {
          font-size: 12px;
          color: #9197ab;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .summary-value {
          font-size: 17px;
          font-weight: 700;
          color: #0d0f14;
        }

        .footer {
          font-size: 12.5px;
          color: #9197ab;
          margin-top: 12px;
        }

        @media (max-width: 640px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="checkmark-icon">
            <CheckmarkIcon className="checkmark-svg" />
          </div>
          <h2 className="heading">Bank Connected!</h2>
          <p className="subheading">
            Your {data?.bankName || 'Barclays'} account is connected. We're now analysing 6 months of transactions.
          </p>
          <div className="summary-grid">
            {summaryData.map(({ label, value }) => (
              <div key={label} className="summary-item">
                <div className="summary-label">{label}</div>
                <div className="summary-value">{value}</div>
              </div>
            ))}
          </div>
          <Button onClick={handleViewAssessment}>View Full Assessment</Button>
          <div className="footer">
            🔒 Read-only connection · Manage in Settings · Revoke anytime
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
