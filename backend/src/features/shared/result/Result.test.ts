import { Result } from './Result';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok('success value');

      expect(result.isOk).toBe(true);
      expect(result.isFail).toBe(false);
      expect(result.getOrThrow()).toBe('success value');
    });
  });
});
