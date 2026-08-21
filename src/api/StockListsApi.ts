import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class StockListsApi extends BaseResource {
  add(name: string): Promise<Record<string, unknown>> {
    return this.call('addStockList', { name }, HttpMethod.POST);
  }

  addTicker(
    listId: number | string,
    ticker: string,
  ): Promise<Record<string, unknown>> {
    return this.call(
      'addStockListTicker',
      { id: listId, ticker },
      HttpMethod.POST,
    );
  }

  delete(listId: number | string): Promise<Record<string, unknown>> {
    return this.call('deleteStockList', { id: listId }, HttpMethod.POST);
  }

  deleteTicker(
    listId: number | string,
    ticker: string,
  ): Promise<Record<string, unknown>> {
    return this.call(
      'deleteStockListTicker',
      { id: listId, ticker },
      HttpMethod.POST,
    );
  }

  list(): Promise<Record<string, unknown>> {
    return this.call('getUserStockLists', {}, HttpMethod.POST);
  }

  select(listId: number | string): Promise<Record<string, unknown>> {
    return this.call('makeStockListSelected', { id: listId }, HttpMethod.POST);
  }

  update(
    listId: number | string,
    params: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.call(
      'updateStockList',
      { id: listId, ...params },
      HttpMethod.POST,
    );
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
