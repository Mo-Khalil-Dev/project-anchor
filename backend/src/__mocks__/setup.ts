import { setupServer } from 'msw/node';
import { tinkHandlers } from './tink.handlers';

const server = setupServer(...tinkHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
