import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class QuotesApi extends BaseResource {
  checkAllowed(ticker: string): Promise<Record<string, unknown>> {
    return this.call(
      'checkAllowedTickerAndBanOnTrade',
      { ticker },
      HttpMethod.POST,
    );
  }

  find(text: string): Promise<Record<string, unknown>> {
    return this.call('tickerFinder', { text }, HttpMethod.POST);
  }

  get(tickers: string | string[]): Promise<Record<string, unknown>> {
    const list = Array.isArray(tickers) ? tickers : [tickers];
    return this.call(
      'getStockQuotesJson',
      { tickers: list.join(',') },
      HttpMethod.POST,
    );
  }

  hloc(
    ticker: string,
    from: number | string,
    to: number | string,
    timeframe: number | null = null,
  ): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = {
      id: ticker,
      count: -1,
      timeStart: from,
      timeEnd: to,
    };
    if (timeframe !== null) {
      params.timeframe = timeframe;
    }
    return this.call('getHloc', params, HttpMethod.POST);
  }

  info(ticker: string, sup = true): Promise<Record<string, unknown>> {
    return this.call('getSecurityInfo', { ticker, sup }, HttpMethod.POST);
  }

  marketStatus(): Promise<Record<string, unknown>> {
    return this.call('getMarketStatus', {}, HttpMethod.POST);
  }

  options(mktName: string, baseAsset: string): Promise<Record<string, unknown>> {
    return this.call(
      'getOptionsByMktNameAndBaseAsset',
      { mktName, baseAsset },
      HttpMethod.POST,
    );
  }

  top(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.call('getTopSecurities', params, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
