import type { Session } from '../auth/Session.js';
import type { Clock } from '../clock/Clock.js';
import { SystemClock } from '../clock/Clock.js';
import { DEFAULT_USER_AGENT } from '../config/ClientConfig.js';
import { normalizeDomain } from '../config/Domain.js';
import { ConfigurationError } from '../errors/ConfigurationError.js';
import { TransportError } from '../errors/TransportError.js';
import { HttpMethod } from './HttpMethod.js';
import { ResponseParser } from './ResponseParser.js';
import { Signer } from './Signer.js';
import type { Transport } from './Transport.js';

export class PublicApiClient implements Transport {
  private readonly baseUri: string;
  private readonly signer: Signer;
  private readonly parser = new ResponseParser();
  private readonly clock: Clock;
  private cookies: Record<string, string> = {};

  constructor(
    private readonly apiPublicKey: string,
    apiSecretKey: string,
    apiHost = 'https://tradernet.com',
    clock: Clock | null = null,
    private readonly timeoutMs = 30_000,
    private readonly userAgent = DEFAULT_USER_AGENT,
  ) {
    this.baseUri = `${normalizeDomain(apiHost)}/api/`;
    this.signer = new Signer(apiSecretKey);
    this.clock = clock ?? new SystemClock();
  }

  setLanguage(lang: string): this {
    this.cookies.lang = lang;
    return this;
  }

  async request(
    command: string,
    data: Record<string, unknown> = {},
    method: HttpMethod = HttpMethod.POST,
    session: Session | null = null,
    attachSid = true,
  ): Promise<Record<string, unknown>> {
    if (command.includes('://') || command.includes('..') || command.startsWith('/')) {
      throw new ConfigurationError('Absolute or traversing API commands are not allowed');
    }

    const timestamp = this.clock.now();
    const cookies = { ...this.cookies };
    if (attachSid && session !== null) {
      cookies[session.sidName] = session.sid;
    }

    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      'X-NtApi-PublicKey': this.apiPublicKey,
      'X-NtApi-Timestamp': String(timestamp),
    };

    let url = `${this.baseUri}${command}`;
    let body: string | undefined;

    if (method === HttpMethod.GET) {
      headers['X-NtApi-Sig'] = this.signer.sign(String(timestamp));
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        params.set(key, String(value));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    } else {
      body = this.signer.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['X-NtApi-Sig'] = this.signer.sign(body + String(timestamp));
    }

    if (Object.keys(cookies).length > 0) {
      headers.Cookie = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: method === HttpMethod.GET ? undefined : body,
        signal: controller.signal,
        redirect: 'manual',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new TransportError(`Tradernet API transport error: ${message}`, {
        cause: e,
      });
    } finally {
      clearTimeout(timer);
    }

    const raw = await response.text();
    const statusCode = response.status;

    if (statusCode >= 400 && statusCode !== 429) {
      this.parser.throwForErrorResponse(raw, statusCode);
    }

    return this.parser.parse(raw, statusCode, response.headers);
  }
}
