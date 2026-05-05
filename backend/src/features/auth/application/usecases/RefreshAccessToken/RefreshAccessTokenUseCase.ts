import type { RefreshAccessTokenInput, RefreshAccessTokenOutput } from './RefreshAccessToken.dto';
import type { ITokenService } from '../../services/ITokenService';

export class RefreshAccessTokenUseCase {
  constructor(private tokenService: ITokenService) {}

  async execute(input: RefreshAccessTokenInput): Promise<RefreshAccessTokenOutput> {
    const newTokens = await this.tokenService.refreshAccessToken(input.refreshToken);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: newTokens.expiresIn,
    };
  }
}
