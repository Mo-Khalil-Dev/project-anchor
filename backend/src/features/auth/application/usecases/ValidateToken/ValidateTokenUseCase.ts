import type { ValidateTokenInput, ValidateTokenOutput } from './ValidateToken.dto';
import type { ITokenService } from '../../services/ITokenService';
import type { IUserRepository } from '../../repositories/IUserRepository';

export class ValidateTokenUseCase {
  constructor(
    private tokenService: ITokenService,
    private userRepository: IUserRepository
  ) {}

  async execute(input: ValidateTokenInput): Promise<ValidateTokenOutput> {
    try {
      const authUser = await this.tokenService.validateAccessToken(input.accessToken);

      // Find user in database
      const userResult = await this.userRepository.findByExternalId(authUser.externalId);
      const dbUser = userResult.getOrElse(null);

      if (!dbUser) {
        return {
          isValid: false,
          error: 'User not found',
        };
      }

      return {
        isValid: true,
        user: {
          id: dbUser.id,
          email: dbUser.getEmail(),
          firstName: dbUser.getFirstName(),
          lastName: dbUser.getLastName(),
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      };
    }
  }
}
