export const MANDATE_STATUS = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  ACTIVE: 'ACTIVE',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export const mandateStatusValues = Object.values(MANDATE_STATUS);

export type MandateStatus = (typeof MANDATE_STATUS)[keyof typeof MANDATE_STATUS];

export function isMandateStatus(value: string): value is MandateStatus {
  return mandateStatusValues.includes(value as MandateStatus);
}
