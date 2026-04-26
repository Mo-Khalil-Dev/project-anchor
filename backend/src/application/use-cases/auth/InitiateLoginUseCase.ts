import type { IAuthProvider } from '../../../domain/auth/IAuthProvider';

export interface InitiateLoginInput {
  redirectUri: string;
}

export interface InitiateLoginOutput {
  loginUrl: string;
  state: string;
}

export class InitiateLoginUseCase {
  constructor(private authProvider: IAuthProvider) {}

  async execute(input: InitiateLoginInput): Promise<InitiateLoginOutput> {
    const { loginUrl, state } = await this.authProvider.initiateLogin(input.redirectUri);

    return {
      loginUrl,
      state,
    };
  }
}
