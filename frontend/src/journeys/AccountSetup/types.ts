export type AccountSetupStep = 'checking' | 'linking' | 'success' | 'error' | 'help' | 'redirect';

export type UtilityType = 'water' | 'gas' | 'electricity';

export interface LinkDetails {
  utilityType: UtilityType;
  postcode: string;
  accountRef: string;
  /** Backend error message — populated on failure, displayed by ErrorState when ready */
  errorMessage?: string;
}
