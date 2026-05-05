import type { Result } from '../../../shared/result';
import type { SessionLog } from '../../domain/entities/SessionLog';
import type { SessionAction } from '../../domain/entities/SessionLog';

export interface CreateSessionLogInput {
  userId: string;
  action: SessionAction;
  ipAddress?: string;
  userAgent?: string;
}

export interface ISessionLogRepository {
  /**
   * Log a user session action (login, logout, etc)
   */
  log(input: CreateSessionLogInput): Promise<Result<SessionLog, Error>>;
}
