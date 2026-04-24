import { setupServer } from 'msw/node';
import { tinkHandlers } from './tink.handlers';

export const server = setupServer(...tinkHandlers);
