export interface LogoutInput {
  userId: string;
  refreshToken?: string;
  allSessions?: boolean;
}

export interface LogoutOutput {
  success: boolean;
}
