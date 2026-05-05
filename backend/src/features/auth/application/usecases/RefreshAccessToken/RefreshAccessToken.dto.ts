export interface RefreshAccessTokenInput {
  refreshToken: string;
}

export interface RefreshAccessTokenOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
