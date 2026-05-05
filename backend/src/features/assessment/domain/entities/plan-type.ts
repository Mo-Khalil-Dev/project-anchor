export const PLAN_TYPE = {
  CONSERVATIVE: 'Conservative',
  BALANCED: 'Balanced',
  AGGRESSIVE: 'Aggressive',
} as const;

export const planTypeValues = Object.values(PLAN_TYPE);

export type PlanType = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

export function isPlanType(value: string): value is PlanType {
  return planTypeValues.includes(value as PlanType);
}
