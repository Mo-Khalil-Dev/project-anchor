import type { ReactNode } from 'react';
import type { UtilityType } from '../types';

export interface UtilityTypeDefinition {
  id: UtilityType;
  label: string;
  description: string;
  icon: (color: string) => ReactNode;
}

export const UTILITY_TYPES: UtilityTypeDefinition[] = [
  {
    id: 'water',
    label: 'Water',
    description: 'Water supply & sewerage',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C11 3 4 10 4 14a7 7 0 0014 0C18 10 11 3 11 3Z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round" />
        <path d="M8 16a4 4 0 006-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'gas',
    label: 'Gas',
    description: 'Natural gas supply',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3c0 0-5 4-5 9s2 7 5 7 5-2 5-7-5-9-5-9Z" stroke={c} strokeWidth="1.7" fill="none" />
        <path d="M9 14c0 2 1.5 3 2 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 9c0 0 2 2 2 4" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'electricity',
    label: 'Electricity',
    description: 'Electricity supply',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M13 3L7 12h5l-3 7 8-10h-5l3-6Z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function findUtilityType(id: UtilityType | ''): UtilityTypeDefinition | undefined {
  return UTILITY_TYPES.find((t) => t.id === id);
}
