import { Result, combineResults, wrapAsync } from '../../../../src/shared/result/Result';
import { ApplicationError } from '../../../../src/shared/errors/ApplicationError';

describe('Result Pattern', () => {
  describe('Result.ok()', () => {
    it('should create a successful result with a value', () => {
      const result = Result.ok(42);
      expect(result.isOk).toBe(true);
      expect(result.isFail).toBe(false);
    });

    it('should handle various value types', () => {
      expect(Result.ok(42).isOk).toBe(true);
      expect(Result.ok('string').isOk).toBe(true);
      expect(Result.ok({ id: 1 }).isOk).toBe(true);
      expect(Result.ok([1, 2, 3]).isOk).toBe(true);
      expect(Result.ok(null).isOk).toBe(true);
    });
  });

  describe('Result.fail()', () => {
    it('should create a failed result with an error', () => {
      const error = new Error('Something went wrong');
      const result = Result.fail(error);
      expect(result.isOk).toBe(false);
      expect(result.isFail).toBe(true);
    });

    it('should work with custom error types', () => {
      const error = new ApplicationError('NOT_FOUND', 'User not found', 404);
      const result = Result.fail(error);
      expect(result.isFail).toBe(true);
    });

    it('should work with string errors', () => {
      const result = Result.fail('Error message');
      expect(result.isFail).toBe(true);
    });
  });

  describe('getOrThrow()', () => {
    it('should return the value if successful', () => {
      const result = Result.ok(42);
      expect(result.getOrThrow()).toBe(42);
    });

    it('should throw if failed', () => {
      const error = new Error('Test error');
      const result = Result.fail(error);
      expect(() => result.getOrThrow()).toThrow();
    });

    it('should throw with error message', () => {
      const result = Result.fail(new Error('Specific error'));
      expect(() => result.getOrThrow()).toThrow('Cannot get value from failed result');
    });
  });

  describe('getOrElse()', () => {
    it('should return value if successful', () => {
      const result = Result.ok(42);
      expect(result.getOrElse(99)).toBe(42);
    });

    it('should return default value if failed', () => {
      const result = Result.fail(new Error('Failed'));
      expect(result.getOrElse(99)).toBe(99);
    });

    it('should work with complex default values', () => {
      const defaultObj = { id: 1, name: 'default' };
      const result = Result.fail(new Error('Failed'));
      expect(result.getOrElse(defaultObj)).toEqual(defaultObj);
    });
  });

  describe('getError()', () => {
    it('should return error if failed', () => {
      const error = new Error('Test error');
      const result = Result.fail(error);
      expect(result.getError()).toBe(error);
    });

    it('should return undefined if successful', () => {
      const result = Result.ok(42);
      expect(result.getError()).toBeUndefined();
    });
  });

  describe('map()', () => {
    it('should transform successful value', () => {
      const result = Result.ok(5);
      const mapped = result.map(x => x * 2);
      expect(mapped.getOrThrow()).toBe(10);
    });

    it('should preserve failure on failed result', () => {
      const error = new Error('Failed');
      const result = Result.fail<number>(error);
      const mapped = result.map(x => x * 2);
      expect(mapped.isFail).toBe(true);
      expect(mapped.getError()).toBe(error);
    });

    it('should transform different types', () => {
      const result = Result.ok(42);
      const mapped = result.map(x => x.toString());
      expect(mapped.getOrThrow()).toBe('42');
      expect(typeof mapped.getOrThrow()).toBe('string');
    });

    it('should catch errors thrown in map function', () => {
      const result = Result.ok(5);
      const mapped = result.map(() => {
        throw new Error('Map error');
      });
      expect(mapped.isFail).toBe(true);
    });

    it('should chain multiple maps', () => {
      const result = Result.ok(5)
        .map(x => x * 2)
        .map(x => x + 10)
        .map(x => x.toString());

      expect(result.getOrThrow()).toBe('20');
    });
  });

  describe('mapError()', () => {
    it('should transform error', () => {
      const result = Result.fail<number>(new Error('Original error'));
      const mapped = result.mapError(err => new ApplicationError(
        'WRAPPED_ERROR',
        `Wrapped: ${err.message}`,
        500
      ));

      expect(mapped.isFail).toBe(true);
      const error = mapped.getError() as ApplicationError;
      expect(error.code).toBe('WRAPPED_ERROR');
      expect(error.message).toContain('Original error');
    });

    it('should preserve success on successful result', () => {
      const result = Result.ok(42);
      const mapped = result.mapError(() => new Error('Should not happen'));
      expect(mapped.isOk).toBe(true);
      expect(mapped.getOrThrow()).toBe(42);
    });
  });

  describe('flatMap()', () => {
    it('should chain results together', () => {
      const result = Result.ok(5)
        .flatMap(x => Result.ok(x * 2))
        .flatMap(x => Result.ok(x + 10));

      expect(result.getOrThrow()).toBe(20);
    });

    it('should short-circuit on failure', () => {
      const error = new Error('Failed');
      const result = Result.ok(5)
        .flatMap(() => Result.fail<number>(error))
        .flatMap(() => Result.ok(99));

      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('should work with different return types', () => {
      const result = Result.ok('hello')
        .flatMap(x => Result.ok(x.length))
        .flatMap(x => Result.ok({ count: x }));

      expect(result.getOrThrow()).toEqual({ count: 5 });
    });
  });

  describe('match()', () => {
    it('should execute onOk for successful result', () => {
      const result = Result.ok(42);
      const matched = result.match(
        ok => ok * 2,
        () => 0
      );
      expect(matched).toBe(84);
    });

    it('should execute onFail for failed result', () => {
      const result: Result<number, Error> = Result.fail(new Error('Failed'));
      const matched = result.match(
        ok => ok * 2,
        () => 0
      );
      expect(matched).toBe(0);
    });

    it('should allow different return types', () => {
      const result = Result.ok(42);
      const matched = result.match(
        ok => `Success: ${ok}`,
        () => 'Failed'
      );
      expect(matched).toBe('Success: 42');
    });

    it('should handle error details in match', () => {
      const error = new ApplicationError('NOT_FOUND', 'User not found', 404);
      const result = Result.fail<string>(error);
      const matched = result.match(
        ok => ok,
        err => {
          if (err instanceof ApplicationError) {
            return `Error ${err.statusCode}: ${err.message}`;
          }
          return 'Unknown error';
        }
      );
      expect(matched).toBe('Error 404: User not found');
    });
  });

  describe('tap()', () => {
    it('should execute side effects without transforming value', () => {
      let sideEffect = '';
      const result = Result.ok(42)
        .tap(ok => { sideEffect = `Got ${ok}`; });

      expect(result.getOrThrow()).toBe(42);
      expect(sideEffect).toBe('Got 42');
    });

    it('should execute onFail for failed result', () => {
      let errorLogged = '';
      const error = new Error('Failed');
      const result = Result.fail<number>(error)
        .tap(
          undefined,
          err => { errorLogged = err.message; }
        );

      expect(result.isFail).toBe(true);
      expect(errorLogged).toBe('Failed');
    });

    it('should allow chaining after tap', () => {
      const result = Result.ok(5)
        .tap(v => console.log(`Value is ${v}`))
        .map(x => x * 2);

      expect(result.getOrThrow()).toBe(10);
    });

    it('should not execute handlers if not provided', () => {
      const result = Result.ok(42).tap();
      expect(result.getOrThrow()).toBe(42);
    });
  });

  describe('and()', () => {
    it('should return next result if current is successful', () => {
      const result = Result.ok(1)
        .and(Result.ok(2));

      expect(result.getOrThrow()).toBe(2);
    });

    it('should return failure if current is failed', () => {
      const error = new Error('Failed');
      const result = Result.fail<number>(error)
        .and(Result.ok(2));

      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('should short-circuit on first failure', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      const result = Result.fail<number>(error1)
        .and(Result.fail<number>(error2));

      expect(result.getError()).toBe(error1);
    });
  });

  describe('or()', () => {
    it('should return first successful result', () => {
      const result = Result.ok(1)
        .or(Result.ok(2));

      expect(result.getOrThrow()).toBe(1);
    });

    it('should return fallback if first fails', () => {
      const result = Result.fail<number>(new Error('Failed'))
        .or(Result.ok(2));

      expect(result.getOrThrow()).toBe(2);
    });

    it('should return last failure if all fail', () => {
      const error2 = new Error('Second error');
      const result = Result.fail<number>(new Error('First'))
        .or(Result.fail<number>(error2));

      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(error2);
    });
  });

  describe('toPromise()', () => {
    it('should convert successful result to resolved promise', async () => {
      const result = Result.ok(42);
      const value = await result.toPromise();
      expect(value).toBe(42);
    });

    it('should convert failed result to rejected promise', async () => {
      const error = new Error('Failed');
      const result = Result.fail(error);
      await expect(result.toPromise()).rejects.toBe(error);
    });
  });

  describe('equals()', () => {
    it('should return true for equal successful results', () => {
      const result1 = Result.ok(42);
      const result2 = Result.ok(42);
      expect(result1.equals(result2)).toBe(true);
    });

    it('should return false for different successful values', () => {
      const result1 = Result.ok(42);
      const result2: Result<number, Error> = Result.ok(99);
      expect(result1.equals(result2)).toBe(false);
    });

    it('should return true for equal failed results', () => {
      const error = new Error('Same error');
      const result1 = Result.fail(error);
      const result2 = Result.fail(error);
      expect(result1.equals(result2)).toBe(true);
    });

    it('should return false for different error types', () => {
      const result1 = Result.fail(new Error('Error 1'));
      const result2 = Result.fail(new Error('Error 2'));
      expect(result1.equals(result2)).toBe(false);
    });

    it('should return false for ok vs fail', () => {
      const result1 = Result.ok(42);
      const result2: Result<number, Error> = Result.fail(new Error('Failed'));
      expect(result1.equals(result2)).toBe(false);
    });
  });

  describe('combineResults()', () => {
    it('should combine multiple successful results', () => {
      const results = [
        Result.ok(1),
        Result.ok(2),
        Result.ok(3),
      ];
      const combined = combineResults(results);
      expect(combined.getOrThrow()).toEqual([1, 2, 3]);
    });

    it('should return first failure', () => {
      const error = new Error('Second failed');
      const results = [
        Result.ok(1),
        Result.fail<number>(error),
        Result.ok(3),
      ];
      const combined = combineResults(results);
      expect(combined.isFail).toBe(true);
      expect(combined.getError()).toBe(error);
    });

    it('should handle empty array', () => {
      const combined = combineResults([]);
      expect(combined.getOrThrow()).toEqual([]);
    });
  });

  describe('wrapAsync()', () => {
    it('should wrap successful async operation', async () => {
      const result = await wrapAsync(() => Promise.resolve(42));
      expect(result.isOk).toBe(true);
      expect(result.getOrThrow()).toBe(42);
    });

    it('should wrap failed async operation', async () => {
      const error = new Error('Async failed');
      const result = await wrapAsync(() => Promise.reject(error));
      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('should use custom error handler', async () => {
      const result = await wrapAsync(
        () => Promise.reject(new Error('Original')),
        (err) => new ApplicationError('WRAPPED', `Wrapped: ${err}`, 500)
      );
      expect(result.isFail).toBe(true);
      const error = result.getError() as ApplicationError;
      expect(error.code).toBe('WRAPPED');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle user creation with validation', () => {
      const createUser = (name: string, email: string): Result<{ id: string; name: string }, ApplicationError> => {
        if (!name || name.trim() === '') {
          return Result.fail(new ApplicationError(
            'INVALID_NAME',
            'Name cannot be empty',
            400
          ));
        }
        if (!email.includes('@')) {
          return Result.fail(new ApplicationError(
            'INVALID_EMAIL',
            'Email must contain @',
            400
          ));
        }
        return Result.ok<{ id: string; name: string }>({ id: '123', name }) as Result<{ id: string; name: string }, ApplicationError>;
      };

      const result = createUser('John', 'john@example.com');
      expect(result.isOk).toBe(true);
      expect(result.getOrThrow()).toEqual({ id: '123', name: 'John' });

      const failResult = createUser('', 'john@example.com');
      expect(failResult.isFail).toBe(true);
    });

    it('should handle repository pattern', () => {
      const findUserById = (id: string): Result<{ id: string; name: string }, ApplicationError> => {
        if (id === '123') {
          return Result.ok<{ id: string; name: string }>({ id: '123', name: 'John' }) as Result<{ id: string; name: string }, ApplicationError>;
        }
        return Result.fail(new ApplicationError(
          'NOT_FOUND',
          'User not found',
          404
        ));
      };

      const result = findUserById('123')
        .map(user => ({ ...user, name: user.name.toUpperCase() }))
        .map(user => ({ ...user, greeting: `Hello, ${user.name}!` }));

      expect(result.getOrThrow()).toEqual({
        id: '123',
        name: 'JOHN',
        greeting: 'Hello, JOHN!',
      });
    });

    it('should handle use case composition', () => {
      const getUser = (id: string): Result<{ id: string; name: string }, ApplicationError> => {
        return Result.ok<{ id: string; name: string }>({ id, name: 'John' }) as Result<{ id: string; name: string }, ApplicationError>;
      };

      const updateUserName = (user: { id: string; name: string }, newName: string): Result<{ id: string; name: string }, ApplicationError> => {
        if (!newName) {
          return Result.fail(new ApplicationError(
            'INVALID_NAME',
            'Name required',
            400
          ));
        }
        return Result.ok<{ id: string; name: string }>({ ...user, name: newName }) as Result<{ id: string; name: string }, ApplicationError>;
      };

      const result = getUser('123')
        .flatMap(user => updateUserName(user, 'Jane'));

      expect(result.getOrThrow()).toEqual({ id: '123', name: 'Jane' });
    });
  });
});
