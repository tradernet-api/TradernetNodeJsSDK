import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class ShopApi extends BaseResource {
  catalog(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getShopCatalog', params, HttpMethod.POST);
  }

  stockData(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getStockData', params, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
