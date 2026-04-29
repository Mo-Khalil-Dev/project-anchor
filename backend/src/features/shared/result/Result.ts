/**
 * Result<T, E> - Railway-Oriented Programming Pattern
 *
 * Represents the outcome of an operation that can either succeed (Ok) or fail (Fail).
 * Enables explicit error handling without throwing exceptions.
 *
 * Usage:
 * const result = Result.ok(42);
 * if (result.isOk) {
 *   console.log(result.value); // 42
 * }
 *
 * const failed = Result.fail(new Error('Something went wrong'));
 * failed.match(
 *   ok => console.log(ok),
 *   err => console.error(err.message)
 * );
 */

export class Result<T, E = Error> {
  private constructor(
    private readonly _isOk: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  /**
   * Create a successful result with a value
   */
  static ok<U>(value: U): Result<U, Error> {
    return new Result(true, value, undefined) as unknown as Result<U, Error>;
  }

  /**
   * Create a failed result with an error
   */
  static fail<U, F = Error>(error: F): Result<U, F> {
    return new Result(false, undefined, error) as any;
  }

  /**
   * Check if result is successful
   */
  get isOk(): boolean {
    return this._isOk;
  }

  /**
   * Check if result is a failure
   */
  get isFail(): boolean {
    return !this._isOk;
  }

  /**
   * Get the success value, or throw if failed
   */
  getOrThrow(): T {
    if (this._isOk && this.value !== undefined) {
      return this.value;
    }
    throw new Error(`Cannot get value from failed result: ${String(this.error)}`);
  }

  /**
   * Get the success value, or return a default value if failed
   */
  getOrElse(defaultValue: T): T {
    return this._isOk && this.value !== undefined ? this.value : defaultValue;
  }

  /**
   * Get the error value, or undefined if successful
   */
  getError(): E | undefined {
    return !this._isOk ? this.error : undefined;
  }

  /**
   * Transform the success value using a function
   * If already failed, returns self unchanged
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isOk && this.value !== undefined) {
      try {
        const newValue = fn(this.value);
        return Result.ok<U>(newValue) as Result<U, E>;
      } catch (err) {
        return Result.fail<U, E>(err as E);
      }
    }
    return Result.fail<U, E>(this.error!);
  }

  /**
   * Transform the error using a function
   * If successful, returns self unchanged
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (!this._isOk && this.error !== undefined) {
      try {
        const newError = fn(this.error);
        return Result.fail<T, F>(newError);
      } catch (err) {
        return Result.fail<T, F>(err as F);
      }
    }
    return Result.ok<T>(this.value!) as Result<T, F>;
  }

  /**
   * Chain results together (flatMap pattern)
   * Useful for composing operations that return Results
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isOk && this.value !== undefined) {
      try {
        return fn(this.value);
      } catch (err) {
        return Result.fail<U, E>(err as E);
      }
    }
    return Result.fail<U, E>(this.error!);
  }

  /**
   * Execute a function based on whether result is Ok or Fail
   * Returns the result of the matching function
   */
  match<U>(
    onOk: (value: T) => U,
    onFail: (error: E) => U
  ): U {
    if (this._isOk && this.value !== undefined) {
      return onOk(this.value);
    }
    return onFail(this.error!);
  }

  /**
   * Execute side effects based on result without transforming it
   */
  tap(
    onOk?: (value: T) => void,
    onFail?: (error: E) => void
  ): Result<T, E> {
    if (this._isOk && this.value !== undefined && onOk) {
      onOk(this.value);
    } else if (!this._isOk && onFail) {
      onFail(this.error!);
    }
    return this;
  }

  /**
   * Combine two results, short-circuiting on first failure
   */
  and<U>(other: Result<U, E>): Result<U, E> {
    if (!this._isOk) {
      return Result.fail<U, E>(this.error!);
    }
    return other;
  }

  /**
   * Return the first successful result, or the last failure
   */
  or(other: Result<T, E>): Result<T, E> {
    if (this._isOk) {
      return this;
    }
    return other;
  }

  /**
   * Convert to Promise for async operations
   */
  toPromise(): Promise<T> {
    if (this._isOk && this.value !== undefined) {
      return Promise.resolve(this.value);
    }
    return Promise.reject(this.error);
  }

  /**
   * Check if result matches a specific value (for testing)
   */
  equals(other: Result<T, E>): boolean {
    if (this._isOk !== other._isOk) {
      return false;
    }
    if (this._isOk) {
      return this.value === (other as any).value;
    }
    return this.error === (other as any).error;
  }
}

/**
 * Combine multiple results into a single result
 * Returns Ok with array of values if all succeed, or first failure
 */
export function combineResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (result.isFail) {
      return result as Result<T[], E>;
    }
    values.push(result.getOrThrow());
  }

  return Result.ok(values) as Result<T[], E>;
}

/**
 * Execute an async function and wrap its result
 */
export async function wrapAsync<T, E = Error>(
  fn: () => Promise<T>,
  onError?: (err: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return Result.ok<T>(value) as Result<T, E>;
  } catch (err) {
    const error = onError ? onError(err) : (err as E);
    return Result.fail<T, E>(error);
  }
}
