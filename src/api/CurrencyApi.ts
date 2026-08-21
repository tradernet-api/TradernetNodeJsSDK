import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class CurrencyApi extends BaseResource {
  crossRatesForDate(
    date: string,
    extra: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call(
      'getCrossRatesForDate',
      { date, ...extra },
      HttpMethod.POST,
    );
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
