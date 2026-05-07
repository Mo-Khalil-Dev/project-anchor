export const BANK_CONNECTION_STATUS = {
  PENDING: 'PENDING',
  DATA_RETRIEVED: 'DATA_RETRIEVED',
  DISCONNECTED: 'DISCONNECTED',
} as const;
export const bankConnectionStatusValues = Object.values(BANK_CONNECTION_STATUS);
export type BankConnectionStatus =
  (typeof BANK_CONNECTION_STATUS)[keyof typeof BANK_CONNECTION_STATUS];

export function isBankConnectionStatus(value: string): value is BankConnectionStatus {
  return bankConnectionStatusValues.includes(value as BankConnectionStatus);
}
