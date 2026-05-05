import type { IAuthProvider, InitiateLoginInput, InitiateLoginOutput } from '../types/auth.types';

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
