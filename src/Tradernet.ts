import { homedir } from 'node:os';
import { join } from 'node:path';
import { AlertsApi } from './api/AlertsApi.js';
import { AuthApi } from './api/AuthApi.js';
import { BaseResource } from './api/BaseResource.js';
import { CpsApi } from './api/CpsApi.js';
import { CurrencyApi } from './api/CurrencyApi.js';
import { NewsApi } from './api/NewsApi.js';
import { OrdersApi } from './api/OrdersApi.js';
import { PortfolioApi } from './api/PortfolioApi.js';
import { QuotesApi } from './api/QuotesApi.js';
import { ReferenceApi } from './api/ReferenceApi.js';
import { ReportsApi } from './api/ReportsApi.js';
import { SecuritySessionApi } from './api/SecuritySessionApi.js';
import { ShopApi } from './api/ShopApi.js';
import { StockListsApi } from './api/StockListsApi.js';
import { TariffApi } from './api/TariffApi.js';
import { UserApi } from './api/UserApi.js';
import { ReauthGuard } from './auth/ReauthGuard.js';
import { SessionManager } from './auth/SessionManager.js';
import type { SessionStorage } from './auth/SessionStorage.js';
import { FileSessionStorage } from './auth/storage/FileSessionStorage.js';
import { InMemorySessionStorage } from './auth/storage/InMemorySessionStorage.js';
import type { Clock } from './clock/Clock.js';
import { SystemClock } from './clock/Clock.js';
import type { ClientConfig } from './config/ClientConfig.js';
import { ClientConfig as ClientConfigClass } from './config/ClientConfig.js';
import { ConfigFactory } from './config/ConfigFactory.js';
import type { Credentials } from './config/Credentials.js';
import { ConfigurationError } from './errors/ConfigurationError.js';
import type { HttpMethod } from './transport/HttpMethod.js';
import { HttpMethod as HM } from './transport/HttpMethod.js';
import { PublicApiClient } from './transport/PublicApiClient.js';
import type { Transport } from './transport/Transport.js';
import type { WebSocketClient } from './ws/WebSocketClient.js';
import { NodeWebSocketClient } from './ws/NodeWebSocketClient.js';

/**
 * Tradernet SDK facade.
 *
 * @see https://tradernet.com/tradernet-api/
 */
export class Tradernet {
  private readonly config: ClientConfig;
  private readonly transport: Transport;
  private readonly sessions: SessionManager;

  private alertsApi: AlertsApi | null = null;
  private authApi: AuthApi | null = null;
  private cpsApi: CpsApi | null = null;
  private currencyApi: CurrencyApi | null = null;
  private newsApi: NewsApi | null = null;
  private ordersApi: OrdersApi | null = null;
  private portfolioApi: PortfolioApi | null = null;
  private quotesApi: QuotesApi | null = null;
  private referenceApi: ReferenceApi | null = null;
  private reportsApi: ReportsApi | null = null;
  private securitySessionsApi: SecuritySessionApi | null = null;
  private shopApi: ShopApi | null = null;
  private stockListsApi: StockListsApi | null = null;
  private tariffApi: TariffApi | null = null;
  private userApi: UserApi | null = null;

  constructor(
    credentials: Credentials,
    config: ClientConfig | null = null,
    transport: Transport | null = null,
    storage: SessionStorage | null = null,
    clock: Clock | null = null,
  ) {
    this.config = config ?? new ClientConfigClass();
    const resolvedClock = clock ?? new SystemClock();
    this.transport =
      transport ??
      new PublicApiClient(
        credentials.apiKey(),
        credentials.apiSecret(),
        this.config.domain,
        resolvedClock,
        this.config.timeoutMs,
        this.config.userAgent,
      );

    if (this.transport instanceof PublicApiClient) {
      this.transport.setLanguage(this.config.lang);
    }

    const resolvedStorage = storage ?? this.createDefaultStorage();
    const reauth = new ReauthGuard(resolvedStorage, this.config, resolvedClock);
    this.sessions = new SessionManager(
      credentials,
      this.config,
      this.transport,
      resolvedStorage,
      reauth,
      resolvedClock,
    );
  }

  static fromArray(data: Record<string, unknown>): Tradernet {
    const [credentials, config] = ConfigFactory.fromArray(data);
    return new Tradernet(credentials, config);
  }

  static fromEnv(
    env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
  ): Tradernet {
    const [credentials, config] = ConfigFactory.fromEnv(env);
    return new Tradernet(credentials, config);
  }

  static fromIni(path: string): Tradernet {
    const [credentials, config] = ConfigFactory.fromIni(path);
    return new Tradernet(credentials, config);
  }

  async init(): Promise<this> {
    if (this.config.authMode === 'sid_eager') {
      await this.sessions.ensureSession(true);
    }
    return this;
  }

  alerts(): AlertsApi {
    return (this.alertsApi ??= new AlertsApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  auth(): AuthApi {
    return (this.authApi ??= new AuthApi(this.transport, this.sessions, this.config));
  }

  getConfig(): ClientConfig {
    return this.config;
  }

  cps(): CpsApi {
    return (this.cpsApi ??= new CpsApi(this.transport, this.sessions, this.config));
  }

  currency(): CurrencyApi {
    return (this.currencyApi ??= new CurrencyApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  news(): NewsApi {
    return (this.newsApi ??= new NewsApi(this.transport, this.sessions, this.config));
  }

  orders(): OrdersApi {
    return (this.ordersApi ??= new OrdersApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  portfolio(): PortfolioApi {
    return (this.portfolioApi ??= new PortfolioApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  quotes(): QuotesApi {
    return (this.quotesApi ??= new QuotesApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  reference(): ReferenceApi {
    return (this.referenceApi ??= new ReferenceApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  reports(): ReportsApi {
    return (this.reportsApi ??= new ReportsApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  async request(
    command: string,
    data: Record<string, unknown> = {},
    method: HttpMethod = HM.POST,
    requiresSid = false,
  ): Promise<Record<string, unknown>> {
    const runner = new (class extends BaseResource {
      protected override requiresSid(): boolean {
        return false;
      }

      run(
        cmd: string,
        payload: Record<string, unknown>,
        httpMethod: HttpMethod,
        sid: boolean,
      ): Promise<Record<string, unknown>> {
        return this.call(cmd, payload, httpMethod, sid);
      }
    })(this.transport, this.sessions, this.config);

    return runner.run(command, data, method, requiresSid);
  }

  securitySessions(): SecuritySessionApi {
    return (this.securitySessionsApi ??= new SecuritySessionApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  getSessions(): SessionManager {
    return this.sessions;
  }

  shop(): ShopApi {
    return (this.shopApi ??= new ShopApi(this.transport, this.sessions, this.config));
  }

  stockLists(): StockListsApi {
    return (this.stockListsApi ??= new StockListsApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  tariff(): TariffApi {
    return (this.tariffApi ??= new TariffApi(
      this.transport,
      this.sessions,
      this.config,
    ));
  }

  getTransport(): Transport {
    return this.transport;
  }

  user(): UserApi {
    return (this.userApi ??= new UserApi(this.transport, this.sessions, this.config));
  }

  websocket(requireSid = true): WebSocketClient {
    return new NodeWebSocketClient(this.config, this.sessions, requireSid);
  }

  private createDefaultStorage(): SessionStorage {
    if (this.config.authMode === 'keys_only') {
      return new InMemorySessionStorage();
    }

    let path = this.config.sessionPath;
    if (path === null || path === '') {
      const home = homedir();
      if (!home) {
        throw new ConfigurationError(
          'Session path is not configured and HOME is unset. ' +
            'Set ClientConfig.sessionPath or TRADERNET_SESSION_PATH ' +
            '(refusing to store SID under /tmp).',
        );
      }
      path = join(home, '.tradernet', 'sessions');
    }

    return new FileSessionStorage(path);
  }
}
