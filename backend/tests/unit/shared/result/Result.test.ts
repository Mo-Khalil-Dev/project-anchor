import { Result } from './result';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok('success value');

      expect(result.isOk).toBe(true);
      expect(result.isFail).toBe(false);
      expect(result.getOrThrow()).toBe('success value');
    });

    it('should work with objects', () => {
      const data = { id: '1', name: 'test' };
      const result = Result.ok(data);

      expect(result.isOk).toBe(true);
      expect(result.getOrThrow()).toEqual(data);
    });

    it('should work with null', () => {
      const result = Result.ok(null);

      expect(result.isOk).toBe(true);
      expect(result.getOrThrow()).toBeNull();
    });
  });

  describe('fail', () => {
    it('should create a failed result', () => {
      const error = new Error('test error');
      const result = Result.fail(error);

      expect(result.isOk).toBe(false);
      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('should throw when calling getOrThrow on failed result', () => {
      const error = new Error('test error');
      const result = Result.fail(error);

      expect(() => result.getOrThrow()).toThrow('test error');
    });
  });

  describe('getOrThrow', () => {
    it('should return value for ok result', () => {
      const result = Result.ok('value');
      expect(result.getOrThrow()).toBe('value');
    });

    it('should throw error for fail result', () => {
      const error = new Error('fail');
      const result = Result.fail(error);

      expect(() => result.getOrThrow()).toThrow('fail');
    });
  });

  describe('getError', () => {
    it('should return error for fail result', () => {
      const error = new Error('test error');
      const result = Result.fail(error);

      expect(result.getError()).toBe(error);
    });

    it('should return undefined for ok result', () => {
      const result = Result.ok('value');
      expect(result.getError()).toBeUndefined();
    });
  });

  describe('type safety', () => {
    it('should maintain type information for ok', () => {
      const result = Result.ok(42);
      const value = result.getOrThrow();

      expect(typeof value).toBe('number');
    });

    it('should maintain type information for fail', () => {
      const error = new Error('test');
      const result = Result.fail<string>(error);

      expect(result.getError()).toBeInstanceOf(Error);
    });
  });
});
