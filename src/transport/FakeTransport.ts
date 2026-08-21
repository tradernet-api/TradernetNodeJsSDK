import type { Session } from '../auth/Session.js';
import type { HttpMethod } from './HttpMethod.js';
import { HttpMethod as HM } from './HttpMethod.js';
import type { Transport } from './Transport.js';

export type FakeHandler = (
  command: string,
  data: Record<string, unknown>,
  method: HttpMethod,
  session: Session | null,
  attachSid: boolean,
) => Promise<Record<string, unknown>> | Record<string, unknown>;

export class FakeTransport implements Transport {
  readonly calls: Array<{
    command: string;
    data: Record<string, unknown>;
    method: HttpMethod;
    session: Session | null;
    attachSid: boolean;
  }> = [];

  constructor(private readonly handler: FakeHandler = async () => ({})) {}

  async request(
    command: string,
    data: Record<string, unknown> = {},
    method: HttpMethod = HM.POST,
    session: Session | null = null,
    attachSid = true,
  ): Promise<Record<string, unknown>> {
    this.calls.push({ command, data, method, session, attachSid });
    return this.handler(command, data, method, session, attachSid);
  }
}
