import type { Session } from '../auth/Session.js';
import type { HttpMethod } from './HttpMethod.js';

export interface Transport {
  request(
    command: string,
    data?: Record<string, unknown>,
    method?: HttpMethod,
    session?: Session | null,
    attachSid?: boolean,
  ): Promise<Record<string, unknown>>;
}
