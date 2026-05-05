import type { InitiateLoginInput, InitiateLoginOutput } from './InitiateLogin.dto';
import { IAuthProvider } from '@/features/auth/application/services/IAuthProvider';

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
