export interface InitiateLoginInput {
  redirectUri: string;
}

export interface InitiateLoginOutput {
  loginUrl: string;
  state: string;
}
