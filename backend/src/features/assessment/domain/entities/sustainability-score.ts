export const SUSTAINABILITY_SCORE = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export const sustainabilityScoreValues = Object.values(SUSTAINABILITY_SCORE);

export type SustainabilityScore =
  (typeof SUSTAINABILITY_SCORE)[keyof typeof SUSTAINABILITY_SCORE];

export function isSustainabilityScore(value: string): value is SustainabilityScore {
  return sustainabilityScoreValues.includes(value as SustainabilityScore);
}


