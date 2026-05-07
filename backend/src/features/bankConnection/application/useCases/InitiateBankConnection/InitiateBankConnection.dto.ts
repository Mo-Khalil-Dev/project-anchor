export interface InitiateBankConnectionInput {
  customerId: string;
}

export interface InitiateBankConnectionOutput {
  authUrl: string;
  state: string;
}
