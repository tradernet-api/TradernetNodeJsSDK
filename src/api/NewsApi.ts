import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class NewsApi extends BaseResource {
  detail(newsId: number | string): Promise<Record<string, unknown>> {
    return this.call('getNewsDetail', { id: newsId }, HttpMethod.POST);
  }

  list(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.call('getNewsList', params, HttpMethod.POST);
  }

  providers(): Promise<Record<string, unknown>> {
    return this.call('getNewsProvidersList', {}, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
