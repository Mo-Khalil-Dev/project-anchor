import { ConsoleLogger } from './ConsoleLogger';
import type { LogEnvelope } from './log.types';

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
    restore: () => {
      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
    },
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
  });
});
