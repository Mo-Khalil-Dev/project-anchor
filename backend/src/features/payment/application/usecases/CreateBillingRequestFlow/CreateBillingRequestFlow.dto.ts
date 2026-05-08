export interface CreateBillingRequestFlowInput {
  billingRequestId: string;
  /** Where GC sends the customer back after authorization */
  redirectUri: string;
  /** Where GC sends the customer if they exit the flow early */
  exitUri: string;
}

export interface CreateBillingRequestFlowOutput {
  /** Hosted GC URL where the customer authorizes the mandate */
  authorizationUrl: string;
  flowId: string;
}
