export interface CollectBankAccountInput {
  billingRequestId: string;
  accountHolderName: string;
  /** Defaults to GC sandbox test sort code if omitted */
  branchCode?: string;
  /** Defaults to GC sandbox test account number if omitted */
  accountNumber?: string;
  countryCode?: string;
}
