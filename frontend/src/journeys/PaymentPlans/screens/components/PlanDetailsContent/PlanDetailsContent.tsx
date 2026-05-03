import type { AssessmentDetailedDTO, PaymentPlanDTO } from '@/types';
import { MonthlyPaymentCard } from '../MonthlyPaymentCard';
import { KeyNumbersCard } from '../KeyNumbersCard';
import { BenefitsCard } from '../BenefitsCard';
import { StressTestBox } from '../StressTestBox';
import { PaymentTimeline } from '../PaymentTimeline';
import styles from './PlanDetails.module.css';

interface PlanDetailsContentProps {
  plan: PaymentPlanDTO;
  assessment: AssessmentDetailedDTO;
  buffer: number;
  color: 'conservative' | 'balanced' | 'aggressive';
}

export function PlanDetailsContent({ plan, assessment, buffer, color }: PlanDetailsContentProps) {
  const benefitsConfig = {
    conservative: {
      title: 'Why this plan works for you',
      items: [
        { text: 'Leaves £95/month for unexpected expenses — car repairs, medical costs, etc.', ok: true },
        { text: 'Your income is moderate — a smaller commitment means fewer missed payments.', ok: true },
        { text: 'Takes longer, but a plan you can keep beats a fast plan you can\'t.', ok: true },
        { text: 'If your situation improves, you can pay more at any time.', ok: true },
      ],
      stressTest: 'If your car broke down next month and cost £200, you\'d still have £95 – £200 = –£105 deficit. With the Conservative plan, you only lose £35 that month — manageable with one month\'s adjustment.',
      firstDate: '15 May 2026',
      finalDate: '15 Apr 2027',
    },
    balanced: {
      title: 'Pros & considerations',
      items: [
        { text: 'Clears your balance 6 months sooner than Conservative.', ok: true },
        { text: 'Leaves £60/month buffer — enough for minor unexpected costs.', ok: true },
        { text: 'If an unexpected expense exceeds £60, you may miss a payment.', ok: false },
        { text: 'Medium confidence level based on your income stability score.', ok: false },
      ],
      stressTest: 'An unexpected £200 expense would exceed your £60 buffer and put you £140 short. You\'d likely need to pause a payment. This is manageable, but not ideal given your current hardship level.',
      firstDate: '15 May 2026',
      finalDate: '15 Oct 2026',
    },
    aggressive: {
      title: 'Risk assessment',
      items: [
        { text: 'Payment exceeds your disposable income by £10/month.', ok: false },
        { text: 'Any unexpected cost (transport, food) will cause a missed payment.', ok: false },
        { text: 'Missed payments may trigger late fees and worsen your credit record.', ok: false },
        { text: 'Clears your balance the fastest — 3 months.', ok: true },
        { text: 'Only recommended if you have confirmed additional income (e.g. bonus, second earner).', ok: true },
      ],
      stressTest: 'Any unexpected expense immediately pushes you into deficit, forcing missed payments.',
      firstDate: '15 May 2026',
      finalDate: '15 July 2026',
    },
  };

  const config = benefitsConfig[color];

  return (
    <>
      <div className={styles.twoColumn}>
        <div className={styles.leftCol}>
          <MonthlyPaymentCard plan={plan} color={color} />
          <KeyNumbersCard plan={plan} assessment={assessment} buffer={buffer} />
        </div>
        <div className={styles.rightCol}>
          <BenefitsCard title={config.title} items={config.items} />
          <StressTestBox color={color}>{config.stressTest}</StressTestBox>
        </div>
      </div>
      <PaymentTimeline monthlyAmount={plan.monthlyAmount} duration={plan.duration} firstDate={config.firstDate} finalDate={config.finalDate} />
    </>
  );
}
