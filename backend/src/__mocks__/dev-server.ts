/**
 * MSW Dev Server - runs MSW in standalone mode for local development
 * Start with: npm run dev:mocks
 * This intercepts HTTP requests to Tink APIs and returns mocked responses
 */
import { setupServer } from 'msw/node';
import { tinkHandlers } from './tink.handlers';

const server = setupServer(...tinkHandlers);

server.listen({ onUnhandledRequest: 'warn' });

console.log('✓ MSW Dev Server started - Tink APIs will be mocked');
console.log('  - Intercepts: https://api.tink.com/api/v1/oauth/token');
console.log('  - Intercepts: https://api.tink.com/oauth/token');
console.log('  - Intercepts: https://api.tink.com/risk/v1/expense-checks/*');
console.log('  - Intercepts: https://api.tink.com/expense-reports/*');
console.log('  - Intercepts: https://api.tink.com/risk-insights/*');

process.on('SIGTERM', () => {
  console.log('✓ MSW Dev Server shutting down');
  server.close();
  process.exit(0);
});
