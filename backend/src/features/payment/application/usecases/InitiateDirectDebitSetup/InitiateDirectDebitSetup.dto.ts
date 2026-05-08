export interface InitiateDirectDebitSetupInput {
  userId: string;
  accountHolderName: string;
  /** Where GC should redirect the customer back to after authorization */
  redirectUri: string;
  /** Where GC should redirect the customer if they exit the flow early */
  exitUri: string;
}

export interface InitiateDirectDebitSetupOutput {
  authorizationUrl: string;
  billingRequestId: string;
  flowId: string;
}
