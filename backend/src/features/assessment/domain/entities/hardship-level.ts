export const HARDSHIP_LEVEL = {
  SEVERE: 'SEVERE',
  MODERATE: 'MODERATE',
  LOW: 'LOW',
  NONE: 'NONE',
} as const;

export const hardshipLevelValues = Object.values(HARDSHIP_LEVEL);

export type HardshipLevel = (typeof HARDSHIP_LEVEL)[keyof typeof HARDSHIP_LEVEL];

export function isHardshipLevel(value: string): value is HardshipLevel {
  return hardshipLevelValues.includes(value as HardshipLevel);
}
