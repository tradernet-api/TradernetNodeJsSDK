import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class AlertsApi extends BaseResource {
  add(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call('togglePriceAlert', { ...params, del: 0 }, HttpMethod.POST);
  }

  delete(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call('togglePriceAlert', { ...params, del: 1 }, HttpMethod.POST);
  }

  list(): Promise<Record<string, unknown>> {
    return this.call('getAlertsList', {}, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
