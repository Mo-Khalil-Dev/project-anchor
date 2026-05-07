import type { LogoutInput, LogoutOutput } from './Logout.dto';
import type { ITokenService } from '../../services/ITokenService';
import type { ISessionLogRepository } from '../../repositories/ISessionLogRepository';
import type { IUserRepository } from '../../repositories/IUserRepository';
import { UserLoggedOutEvent } from '@/features/auth/domain/events';

export class LogoutUseCase {
  constructor(
    private tokenService: ITokenService,
    private sessionLogRepository: ISessionLogRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    try {
      // Load user aggregate
      const userResult = await this.userRepository.findById(input.userId);
      const user = userResult.getOrElse(null);

      // Revoke tokens
      if (input.allSessions) {
        // Revoke all refresh tokens for the user (logout all devices)
        await this.tokenService.revokeAllUserTokens(input.userId);
      } else if (input.refreshToken) {
        // Revoke single refresh token (logout current device)
        await this.tokenService.revokeRefreshToken(input.refreshToken);
      }

      // Record logout event on user aggregate
      if (user) {
        const reason = input.allSessions ? 'logout_all_sessions' : 'logout_single_session';
        user.recordDomainEvent(new UserLoggedOutEvent(user.id, user.getVersion(), { reason }));

        // Publish domain events
        const domainEvents = user.getDomainEvents();
        for (const event of domainEvents) {
          if (event instanceof UserLoggedOutEvent) {
            // Log logout action
            await this.sessionLogRepository.log({
              userId: input.userId,
              action: 'LOGOUT',
            });
          }
        }
        user.clearDomainEvents();
      } else {
        // Fallback if user not found (shouldn't happen in normal flow)
        await this.sessionLogRepository.log({
          userId: input.userId,
          action: 'LOGOUT',
        });
      }

      return { success: true };
    } catch (error) {
      // Log the error but still consider logout successful
      // (frontend should clear tokens regardless)
      console.error('Logout error:', error);
      return { success: true };
    }
  }
}
