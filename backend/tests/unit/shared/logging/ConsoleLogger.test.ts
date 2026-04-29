import { ConsoleLogger } from '../../../../src/features/shared/logging/ConsoleLogger';
import type { LogEnvelope } from '../../../../src/features/shared/logging/log.types';

const BASE_META = {
  service: 'bridge-backend',
  environment: 'development',
  runtime: 'local',
  minLevel: 'debug' as const,
};

function captureOutput() {
  const stdout: LogEnvelope[] = [];
  const stderr: LogEnvelope[] = [];

  const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation((data) => {
    stdout.push(JSON.parse(String(data)));
    return true;
  });

  const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation((data) => {
    stderr.push(JSON.parse(String(data)));
    return true;
  });

  return {
    stdout,
    stderr,
    restore: () => { stdoutSpy.mockRestore(); stderrSpy.mockRestore(); },
  };
}

describe('ConsoleLogger', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('log envelope', () => {
    it('writes required envelope fields on every log', () => {
      const { stdout, restore } = captureOutput();
      const logger = new ConsoleLogger(BASE_META);

      logger.info('Test message');

      expect(stdout).toHaveLength(1);
      expect(stdout[0]).toMatchObject({
        level: 'info',
        service: 'bridge-backend',
        environment: 'development',
        runtime: 'local',
        message: 'Test message',
      });
      expect(stdout[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      restore();
    });

    it('does not include context or error fields when not provided', () => {
      const { stdout, restore } = captureOutput();
      new ConsoleLogger(BASE_META).info('Clean message');

      expect(stdout[0].context).toBeUndefined();
      expect(stdout[0].error).toBeUndefined();
      restore();
    });

    it('includes context when provided', () => {
      const { stdout, restore } = captureOutput();
      new ConsoleLogger(BASE_META).info('With context', { customerId: 'abc', amount: 100 });

      expect(stdout[0].context).toEqual({ customerId: 'abc', amount: 100 });
      restore();
    });
  });

  describe('log levels', () => {
    it('writes debug and info to stdout', () => {
      const { stdout, stderr, restore } = captureOutput();
      const logger = new ConsoleLogger(BASE_META);

      logger.debug('debug msg');
      logger.info('info msg');

      expect(stdout).toHaveLength(2);
      expect(stderr).toHaveLength(0);
      restore();
    });

    it('writes warn and error to stderr', () => {
      const { stdout, stderr, restore } = captureOutput();
      const logger = new ConsoleLogger(BASE_META);

      logger.warn('warn msg');
      logger.error('error msg');

      expect(stdout).toHaveLength(0);
      expect(stderr).toHaveLength(2);
      restore();
    });

    it('filters out logs below the configured minLevel', () => {
      const { stdout, restore } = captureOutput();
      const logger = new ConsoleLogger({ ...BASE_META, minLevel: 'warn' });

      logger.debug('filtered debug');
      logger.info('filtered info');

      expect(stdout).toHaveLength(0);
      restore();
    });

    it('passes logs at or above minLevel', () => {
      const { stderr, restore } = captureOutput();
      const logger = new ConsoleLogger({ ...BASE_META, minLevel: 'warn' });

      logger.warn('passes');
      logger.error('passes');

      expect(stderr).toHaveLength(2);
      restore();
    });
  });

  describe('traceId', () => {
    it('promotes traceId from context to top-level envelope field', () => {
      const { stdout, restore } = captureOutput();
      new ConsoleLogger(BASE_META).info('msg', { traceId: 'trace-123', other: 'val' });

      expect(stdout[0].traceId).toBe('trace-123');
      expect(stdout[0].context).toEqual({ other: 'val' });
      expect(stdout[0].context?.traceId).toBeUndefined();
      restore();
    });

    it('promotes traceId bound via child() to top-level', () => {
      const { stdout, restore } = captureOutput();
      const child = new ConsoleLogger(BASE_META).child({ traceId: 'trace-456' });

      child.info('child message');

      expect(stdout[0].traceId).toBe('trace-456');
      restore();
    });
  });

  describe('child()', () => {
    it('merges parent bindings into every child log', () => {
      const { stdout, restore } = captureOutput();
      const child = new ConsoleLogger(BASE_META).child({ customerId: 'cust-1' });

      child.info('msg');

      expect(stdout[0].context).toMatchObject({ customerId: 'cust-1' });
      restore();
    });

    it('merges call-site context on top of child bindings', () => {
      const { stdout, restore } = captureOutput();
      const child = new ConsoleLogger(BASE_META).child({ customerId: 'cust-1' });

      child.info('msg', { assessmentId: 'assess-2' });

      expect(stdout[0].context).toMatchObject({
        customerId: 'cust-1',
        assessmentId: 'assess-2',
      });
      restore();
    });

    it('call-site context overrides child bindings for same key', () => {
      const { stdout, restore } = captureOutput();
      const child = new ConsoleLogger(BASE_META).child({ key: 'parent' });

      child.info('msg', { key: 'override' });

      expect(stdout[0].context?.key).toBe('override');
      restore();
    });

    it('does not mutate the parent logger bindings', () => {
      const { stdout, restore } = captureOutput();
      const parent = new ConsoleLogger(BASE_META);
      parent.child({ customerId: 'cust-1' });

      parent.info('parent msg');

      expect(stdout[0].context).toBeUndefined();
      restore();
    });
  });

  describe('error formatting', () => {
    it('includes error envelope when an Error is passed', () => {
      const { stderr, restore } = captureOutput();
      const err = new Error('Something broke');

      new ConsoleLogger(BASE_META).error('Failed', err);

      expect(stderr[0].error).toMatchObject({
        name: 'Error',
        message: 'Something broke',
      });
      restore();
    });

    it('includes stack in development environment', () => {
      const { stderr, restore } = captureOutput();
      new ConsoleLogger(BASE_META).error('Failed', new Error('boom'));

      expect(stderr[0].error?.stack).toBeDefined();
      restore();
    });

    it('omits stack in production environment', () => {
      const { stderr, restore } = captureOutput();
      const logger = new ConsoleLogger({ ...BASE_META, environment: 'production' });

      logger.error('Failed', new Error('boom'));

      expect(stderr[0].error?.stack).toBeUndefined();
      restore();
    });

    it('extracts code, statusCode, and details from domain/application errors', () => {
      const { stderr, restore } = captureOutput();
      const err = Object.assign(new Error('Invalid income'), {
        name: 'DomainError',
        code: 'INVALID_INCOME',
        statusCode: 400,
        details: { received: -500 },
      });

      new ConsoleLogger(BASE_META).error('Domain failure', err);

      expect(stderr[0].error).toMatchObject({
        name: 'DomainError',
        code: 'INVALID_INCOME',
        statusCode: 400,
        details: { received: -500 },
      });
      restore();
    });

    it('handles non-Error values gracefully', () => {
      const { stderr, restore } = captureOutput();
      new ConsoleLogger(BASE_META).error('Unexpected', 'just a string');

      expect(stderr[0].error).toMatchObject({
        name: 'UnknownError',
        message: 'just a string',
      });
      restore();
    });

    it('logs error without an error object when none is passed', () => {
      const { stderr, restore } = captureOutput();
      new ConsoleLogger(BASE_META).error('No error object');

      expect(stderr[0].error).toBeUndefined();
      restore();
    });
  });
});
