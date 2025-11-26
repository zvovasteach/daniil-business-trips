import { setupWorker } from 'msw/browser';

import handlers from '@/mocks/msw/handlers';

export const worker = setupWorker(...handlers);
