import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class PortfolioApi extends BaseResource {
  cashflows(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getUserCashFlows', params, HttpMethod.POST);
  }

  get(): Promise<Record<string, unknown>> {
    return this.call('getPositionJson', {}, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
