import { Button } from '@/components/core/Button';
import { HardshipBadge } from '@/components/core/HardshipBadge';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useOverview } from './useOverview';
import styles from './Overview.module.css';

export function AssessmentOverview() {
  const {
    assessment,
    loading,
    error,
    isPending,
    isFailed,
    isCompleted,
    assessmentDate,
    handleExplorePaymentPlans,
    handleGoBack,
  } = useOverview();

  const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 0 });

  return (
    <CustomerLayout currentStep={5} totalSteps={6}>
      {loading && !assessment && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Calculating your assessment...</p>
        </div>
      )}

      {error && !assessment && (
        <div className={styles.errorContainer}>
          <div className={styles.errorTitle}>Assessment Failed</div>
          <div className={styles.errorMessage}>{error}</div>
          <div className={styles.backButton}>
            <Button onClick={handleGoBack}>Go Back</Button>
          </div>
        </div>
      )}

      {assessment && (
        <div className={styles.page}>
          <div className={styles.heading}>
            <h1 className={styles.headingTitle}>Your Financial Assessment</h1>
            <p className={styles.headingSubtitle}>
              Based on 6 months of transaction data from your connected bank, assessed on {assessmentDate}.
            </p>
          </div>

          {isPending && (
            <div className={styles.pendingMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Your assessment is still calculating. We're analysing your financial situation...
            </div>
          )}

          {isFailed && (
            <div className={styles.failedMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Assessment calculation failed. Please try again or contact support.
            </div>
          )}

          {isCompleted && (
            <>
              <div className={styles.badgeRow}>
                <HardshipBadge level={assessment.hardshipLevel} />
                <span className={styles.accountInfo}>Assessed on {assessmentDate}</span>
              </div>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.green}`}>
                  <div className={styles.statValue}>£{fmt(assessment.monthlyIncome)}</div>
                  <div className={styles.statLabel}>Monthly Income</div>
                  <div className={styles.statSub}>Average over 6 months</div>
                </div>
                <div className={`${styles.statCard} ${styles.amber}`}>
                  <div className={styles.statValue}>£{fmt(assessment.monthlyExpenses)}</div>
                  <div className={styles.statLabel}>Total Expenses</div>
                  <div className={styles.statSub}>Essential spending</div>
                </div>
                <div className={`${styles.statCard} ${styles.red}`}>
                  <div className={styles.statValue}>£{fmt(assessment.disposableIncome)}</div>
                  <div className={styles.statLabel}>Disposable Income</div>
                  <div className={styles.statSub}>After essentials</div>
                </div>
              </div>

              <div className={styles.billCard}>
                <div className={styles.billHeader}>
                  <div className={styles.billLeft}>
                    <div className={styles.billLabel}>Bill as % of Disposable Income</div>
                    <div className={styles.billRatioContainer}>
                      <span className={styles.billRatio}>{Math.round(assessment.billRatio)}%</span>
                      <span className={styles.billRatioSub}>of your disposable income</span>
                    </div>
                  </div>
                  <div className={styles.billRight}>
                    <div className={styles.billBalanceLabel}>Your balance</div>
                    <div className={styles.billBalance}>£{fmt(assessment.monthlyBill)}</div>
                  </div>
                </div>

                <div className={styles.benchmarkSection}>
                  <div className={styles.benchmarkLabels}>
                    <span>0%</span>
                    <span>Benchmark: 5–8%</span>
                    <span>Your ratio: {Math.round(assessment.billRatio)}%</span>
                  </div>
                  <div className={styles.benchmarkBar}>
                    <div className={styles.benchmarkGradient}></div>
                    <div className={styles.benchmarkMarkerLeft}></div>
                    <div className={styles.benchmarkMarkerRight}>You</div>
                  </div>
                </div>

                <div className={styles.billExplanation}>
                  <strong>What this means:</strong> The average household spends 5–8% of disposable income on energy bills. Your outstanding balance represents {Math.round(assessment.billRatio)}% of your monthly disposable income — this qualifies as{' '}
                  <strong>{assessment.hardshipLevel.toLowerCase()} financial hardship</strong> under Ofgem guidelines.
                </div>
              </div>

              <div className={styles.formulaCard}>
                <div className={styles.formulaLabel}>How we calculated this</div>
                <div className={styles.formulaRow}>
                  <div className={`${styles.formulaItem} ${styles.green}`}>
                    <div className={styles.formulaItemLabel}>Income</div>
                    <div className={styles.formulaItemValue}>£{fmt(assessment.monthlyIncome)}/mo</div>
                  </div>
                  <span className={styles.formulaOp}>−</span>
                  <div className={`${styles.formulaItem} ${styles.amber}`}>
                    <div className={styles.formulaItemLabel}>Essentials</div>
                    <div className={styles.formulaItemValue}>£{fmt(assessment.monthlyExpenses)}/mo</div>
                  </div>
                  <span className={styles.formulaOp}>=</span>
                  <div className={`${styles.formulaItem} ${styles.red}`}>
                    <div className={styles.formulaItemLabel}>Disposable</div>
                    <div className={styles.formulaItemValue}>£{fmt(assessment.disposableIncome)}/mo</div>
                  </div>
                </div>
              </div>

              <div className={styles.ctaRow}>
                <Button className={styles.ctaButton} variant="primary" onClick={handleExplorePaymentPlans}>
                  Explore Payment Plans
                </Button>
                <Button className={styles.ctaButton} variant="ghost">
                  View Detailed Breakdown
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </CustomerLayout>
  );
}
