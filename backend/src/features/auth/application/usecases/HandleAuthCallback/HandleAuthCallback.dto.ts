export interface HandleAuthCallbackInput {
  code: string;
  state: string;
  redirectUri: string;
}

export interface HandleAuthCallbackOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
