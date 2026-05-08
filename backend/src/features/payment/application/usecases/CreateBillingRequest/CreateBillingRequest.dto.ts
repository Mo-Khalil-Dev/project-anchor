export interface CreateBillingRequestInput {
  /** Free-form metadata for tracing in GC dashboard */
  metadataReference: string;
  /** Our customer ID — propagated to mandate metadata so we can look up our records on webhook */
  customerId: string;
  /** Our referenceData ID — propagated to mandate metadata so we can resolve plan/amount on webhook */
  assessmentId: string;
}

export interface CreateBillingRequestOutput {
  billingRequestId: string;
}
