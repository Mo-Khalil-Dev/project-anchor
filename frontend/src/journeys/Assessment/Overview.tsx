import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/customerSlice';
import { Button } from '@/components/core/Button';
import { HardshipBadge } from '@/components/core/HardshipBadge';
import { SustBadge } from '@/components/core/SustBadge';
import { StatCard } from '@/components/core/StatCard';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import axiosInstance from '@/api/client';

interface Assessment {
  id: string;
  customerId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  disposableIncome: number;
  monthlyBill: number;
  billRatio: number;
  hardshipLevel: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
  sustainabilityScore: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  arrears?: number | null;
  calculatedAt: string;
}


export function AssessmentOverview() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessment();
    const pollInterval = setInterval(() => {
      fetchAssessment();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      if (!assessmentId) {
        setError('Assessment ID is required');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/assessments/${assessmentId}`);
      const data = response.data as Assessment;

      setAssessment(data);
      setError(null);

      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assessment';
      setError(message);
      setLoading(false);
    }
  };

  const handleNext = () => {
    dispatch(setCurrentStep('plan-select'));
    navigate('/plan-select');
  };

  if (loading && !assessment) {
    return (
      <CustomerLayout currentStep={5} totalSteps={6}>
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top-color: #0d0f14;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .loading-text {
            margin-top: 24px;
            font-size: 16px;
            color: #5a5f72;
            font-weight: 500;
          }
        `}</style>
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Calculating your assessment...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (error && !assessment) {
    return (
      <CustomerLayout currentStep={5} totalSteps={6}>
        <style>{`
          .error-container {
            background: #ffebee;
            border: 1px solid #ef5350;
            border-radius: 12px;
            padding: 32px 24px;
            text-align: center;
            margin: 40px 0;
          }

          .error-title {
            font-size: 18px;
            font-weight: 700;
            color: #c62828;
            margin-bottom: 8px;
          }

          .error-message {
            font-size: 14px;
            color: #d32f2f;
            line-height: 1.6;
          }

          .back-button {
            margin-top: 20px;
          }
        `}</style>
        <div className="error-container">
          <div className="error-title">Assessment Failed</div>
          <div className="error-message">{error}</div>
          <div className="back-button">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!assessment) {
    return null;
  }

  const isPending = assessment.status === 'PENDING';
  const isFailed = assessment.status === 'FAILED';
  const isCompleted = assessment.status === 'COMPLETED';

  return (
    <CustomerLayout currentStep={5} totalSteps={6}>
      <style>{`
        .page {
          animation: fadeUp 0.22s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header {
          margin-bottom: 32px;
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
          margin: 0;
        }

        .section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0d0f14;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .expense-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .expense-item {
          background: #f5f5f5;
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .expense-label {
          font-size: 12px;
          color: #9197ab;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .expense-value {
          font-size: 17px;
          font-weight: 700;
          color: #0d0f14;
        }

        .badges-container {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .pending-message {
          background: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          color: #1565c0;
          margin-top: 12px;
        }

        .failed-message {
          background: #ffebee;
          border: 1px solid #ef5350;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          color: #c62828;
          margin-top: 12px;
        }

        .footer {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .expense-grid {
            grid-template-columns: 1fr;
          }

          .heading {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h2 className="heading">Financial Assessment</h2>
          <p className="subheading">Your hardship assessment and payment recommendations</p>
        </div>

        {isPending && (
          <div className="pending-message">
            ⏳ Your assessment is still calculating. We're analysing your financial situation...
          </div>
        )}

        {isFailed && (
          <div className="failed-message">
            ❌ Assessment calculation failed. Please try again or contact support.
          </div>
        )}

        {isCompleted && (
          <>
            <div className="section">
              <div className="section-title">Income & Expenses</div>
              <div className="stats-grid">
                <StatCard label="Monthly Income" value={`£${assessment.monthlyIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`} borderColor="green" icon="💰" />
                <StatCard label="Monthly Expenses" value={`£${assessment.monthlyExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`} borderColor="amber" icon="📊" />
                <StatCard label="Disposable Income" value={`£${assessment.disposableIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`} borderColor="blue" icon="💳" />
              </div>
            </div>

            <div className="section">
              <div className="section-title">Expense Breakdown</div>
              <div className="expense-grid">
                <div className="expense-item">
                  <div className="expense-label">🏠 Housing</div>
                  <div className="expense-value">£{assessment.monthlyExpenses * 0.35 | 0}</div>
                </div>
                <div className="expense-item">
                  <div className="expense-label">🍔 Food & Groceries</div>
                  <div className="expense-value">£{assessment.monthlyExpenses * 0.20 | 0}</div>
                </div>
                <div className="expense-item">
                  <div className="expense-label">⚡ Utilities</div>
                  <div className="expense-value">£{assessment.monthlyExpenses * 0.10 | 0}</div>
                </div>
                <div className="expense-item">
                  <div className="expense-label">🚗 Transport</div>
                  <div className="expense-value">£{assessment.monthlyExpenses * 0.10 | 0}</div>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Bill Affordability</div>
              <div className="stats-grid">
                <StatCard label="Monthly Bill" value={`£${assessment.monthlyBill}`} borderColor="accent" icon="📄" />
                <StatCard label="Affordability Ratio" value={`${assessment.billRatio.toFixed(1)}%`} subLabel="of disposable income" borderColor="accent" icon="📈" />
              </div>
            </div>

            <div className="section">
              <div className="section-title">Hardship Assessment</div>
              <div className="badges-container">
                <HardshipBadge level={assessment.hardshipLevel} />
                <SustBadge level={assessment.sustainabilityScore} />
              </div>
            </div>

            {assessment.arrears && assessment.arrears > 0 && (
              <div className="section">
                <StatCard label="Outstanding Arrears" value={`£${assessment.arrears.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`} borderColor="red" icon="⚠️" />
              </div>
            )}
          </>
        )}

        {!isPending && !isFailed && (
          <div className="footer">
            <Button onClick={handleNext} disabled={!isCompleted}>
              {isPending ? 'Calculating...' : isFailed ? 'Try Again' : 'View Payment Plans'}
            </Button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
