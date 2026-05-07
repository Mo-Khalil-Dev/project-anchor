import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/types';
import type { PendingStepStatus } from './pendingStepRow';

export interface PendingStep {
  label: string;
  /** Time (ms since the assessment started) at which this step becomes active. */
  startsAtMs: number;
  status: PendingStepStatus;
}

interface UseAssessmentPendingViewArgs {
  /** ISO timestamp marking when the backend started the assessment. */
  calculatedAt: string;
  /** How often to recompute progress + step states. Defaults to 200 ms (per spec). */
  tickIntervalMs?: number;
}

const STEP_DEFINITIONS: Array<{ label: string; startsAtMs: number }> = [
  { label: 'Fetching transactions from Barclays',     startsAtMs: 0 },
  { label: 'Categorising 186 transactions',           startsAtMs: 2_800 },
  { label: 'Calculating income & expenses',           startsAtMs: 5_200 },
  { label: 'Running hardship assessment model',       startsAtMs: 7_200 },
  { label: 'Generating payment plan options',         startsAtMs: 9_400 },
];

/** Visual-progress duration in ms. The actual completion is driven by polling. */
const TOTAL_DURATION_MS = 120_000;
/** Spec: percentage never hits 100 — backend controls that. */
export const PROGRESS_CAP = 92;

export function useAssessmentPendingView({ calculatedAt, tickIntervalMs = 200 }: UseAssessmentPendingViewArgs) {
  const userEmail = useSelector((s: RootState) => s.auth.user?.email ?? '');

  const [elapsedMs, setElapsedMs] = useState(() => computeElapsed(calculatedAt));

  useEffect(() => {
    setElapsedMs(computeElapsed(calculatedAt));
    const id = setInterval(() => {
      setElapsedMs(computeElapsed(calculatedAt));
    }, tickIntervalMs);
    return () => clearInterval(id);
  }, [calculatedAt, tickIntervalMs]);

  const progress = computeProgress(elapsedMs);
  const steps = buildSteps(elapsedMs);
  const activeStepLabel = steps.find((s) => s.status === 'active')?.label ?? steps[steps.length - 1].label;

  return { progress, steps, activeStepLabel, userEmail };
}

function computeElapsed(calculatedAt: string): number {
  const startedAt = new Date(calculatedAt).getTime();
  if (Number.isNaN(startedAt)) return 0;
  return Math.max(0, Date.now() - startedAt);
}

function computeProgress(elapsedMs: number): number {
  const pct = (elapsedMs / TOTAL_DURATION_MS) * 100;
  return Math.min(PROGRESS_CAP, Math.max(0, Math.round(pct)));
}

function buildSteps(elapsedMs: number): PendingStep[] {
  // Find the latest step whose start time has passed — that one is active.
  // Anything earlier is done; anything later is pending.
  let activeIndex = -1;
  for (let i = 0; i < STEP_DEFINITIONS.length; i++) {
    if (elapsedMs >= STEP_DEFINITIONS[i].startsAtMs) activeIndex = i;
    else break;
  }

  return STEP_DEFINITIONS.map((step, i) => {
    let status: PendingStepStatus;
    if (i < activeIndex) status = 'done';
    else if (i === activeIndex) status = 'active';
    else status = 'pending';
    return { ...step, status };
  });
}
