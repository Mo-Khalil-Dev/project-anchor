import type { HandleAuthCallbackInput, HandleAuthCallbackOutput } from './HandleAuthCallback.dto';
import { IAuthProvider } from '@/features/auth/application/services/IAuthProvider';
import type { ITokenService } from '../../services/ITokenService';
import type { IUserRepository } from '../../repositories/IUserRepository';
import type { ISessionLogRepository } from '../../repositories/ISessionLogRepository';
import { UserLoggedInEvent, UserCreatedEvent } from '@/features/auth/domain/events';

export class HandleAuthCallbackUseCase {
  constructor(
    private authProvider: IAuthProvider,
    private tokenService: ITokenService,
    private userRepository: IUserRepository,
    private sessionLogRepository: ISessionLogRepository
  ) {}

  async execute(input: HandleAuthCallbackInput): Promise<HandleAuthCallbackOutput> {
    // Exchange auth code for tokens
    const { accessToken, refreshToken, expiresIn, user } = await this.authProvider.handleCallback(
      input.code,
      input.state,
      input.redirectUri
    );

    // Find or create user in database
    // First try by externalId, then by email (for providers with dynamic IDs like mock)
    const findByExternalIdResult = await this.userRepository.findByExternalId(user.externalId);
    let dbUser = findByExternalIdResult.getOrElse(null);

    if (!dbUser) {
      // Try finding by email
      const findByEmailResult = await this.userRepository.findByEmail(user.email);
      dbUser = findByEmailResult.getOrElse(null);
    }

    let isNewUser = false;

    if (!dbUser) {
      isNewUser = true;
      const createResult = await this.userRepository.create({
        email: user.email,
        externalId: user.externalId,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      dbUser = createResult.match(
        (user) => user,
        (error) => { throw error; }
      );
    } else {
      // Update user info and externalId if changed
      dbUser.updateProfile(
        user.firstName || dbUser.getFirstName(),
        user.lastName || dbUser.getLastName()
      );

      if (user.externalId !== dbUser.getExternalId()) {
        const updateResult = await this.userRepository.update({
          id: dbUser.id,
          externalId: user.externalId,
          firstName: dbUser.getFirstName(),
          lastName: dbUser.getLastName(),
        });
        dbUser = updateResult.match(
          (user) => user,
          (error) => { throw error; }
        );
      }
    }

    // Store tokens and get issued tokens back
    const issuedTokens = await this.tokenService.issueTokens(
      accessToken,
      refreshToken,
      expiresIn,
      {
        id: dbUser.id,
        email: dbUser.getEmail(),
        externalId: dbUser.getExternalId(),
        firstName: dbUser.getFirstName(),
        lastName: dbUser.getLastName(),
      }
    );

    // Record successful login event
    dbUser.recordDomainEvent(
      new UserLoggedInEvent(dbUser.id, dbUser.getVersion(), {
        accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      })
    );

    // Publish domain events (use case orchestrates event publishing)
    // For new users, record UserCreatedEvent since it was created via repository
    if (isNewUser) {
      dbUser.recordDomainEvent(
        new UserCreatedEvent(dbUser.id, dbUser.getVersion(), {
          firstName: dbUser.getFirstName() ?? null,
          lastName: dbUser.getLastName() ?? null,
          email: dbUser.getEmail(),
        })
      );
    }

    // For profile updates, the event is already added by updateProfile()
    // Retrieve and publish all domain events
    const domainEvents = dbUser.getDomainEvents();
    for (const event of domainEvents) {
      // For now, just log session on login/user creation
      // Phase 2: Add proper event handler registry
      if (event instanceof UserCreatedEvent || event instanceof UserLoggedInEvent) {
        await this.sessionLogRepository.log({
          userId: dbUser.id,
          action: 'LOGIN',
        });
      }
    }
    dbUser.clearDomainEvents();

    return {
      accessToken: issuedTokens.accessToken,
      refreshToken: issuedTokens.refreshToken,
      expiresIn: issuedTokens.expiresIn,
      user: {
        id: dbUser.id,
        email: dbUser.getEmail(),
        firstName: dbUser.getFirstName(),
        lastName: dbUser.getLastName(),
      },
    };
  }
}
