import { AggregateRoot } from '@/features/shared/domain/AggregateRoot';
import { UserCreatedEvent, UserProfileUpdatedEvent } from '../events';

export class User extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly email: string,
    private readonly externalId: string,
    private firstName: string | undefined,
    private lastName: string | undefined,
    createdAt: Date = new Date()
  ) {
    super(id, createdAt);
  }

  static create(
    id: string,
    email: string,
    externalId: string,
    firstName?: string,
    lastName?: string,
    createdAt: Date = new Date()
  ): User {
    const user = new User(id, email, externalId, firstName, lastName, createdAt);
    user.addDomainEvent(
      new UserCreatedEvent(user.id, user.getVersion(), {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email,
      })
    );
    return user;
  }

  static reconstruct(
    id: string,
    email: string,
    externalId: string,
    firstName?: string,
    lastName?: string,
    createdAt: Date = new Date()
  ): User {
    return new User(id, email, externalId, firstName, lastName, createdAt);
  }

  getEmail(): string {
    return this.email;
  }

  getExternalId(): string {
    return this.externalId;
  }

  getFirstName(): string | undefined {
    return this.firstName;
  }

  getLastName(): string | undefined {
    return this.lastName;
  }

  updateProfile(firstName?: string, lastName?: string): void {
    if (firstName !== undefined) {
      this.firstName = firstName;
    }
    if (lastName !== undefined) {
      this.lastName = lastName;
    }
    this.addDomainEvent(
      new UserProfileUpdatedEvent(this.id, this.getVersion(), {
        firstName: this.firstName ?? null,
        lastName: this.lastName ?? null,
      })
    );
    this.incrementVersion();
  }
}
