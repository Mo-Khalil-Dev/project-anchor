export interface CollectCustomerDetailsInput {
  billingRequestId: string;
  email: string;
  givenName: string;
  familyName: string;
  /** Address line 1 — required by BACS */
  addressLine1: string;
  city: string;
  postalCode: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g. "GB")
}
