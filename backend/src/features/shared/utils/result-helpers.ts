import type { Result } from '../result';

export function extractResultOrNull<T>(result: Result<T | null, Error>): T | null {
  return result.isFail ? null : result.getOrElse(null);
}
