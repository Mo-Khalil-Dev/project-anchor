export interface ValidateTokenInput {
  accessToken: string;
}

export interface ValidateTokenOutput {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
}
