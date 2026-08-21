import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class ReferenceApi extends BaseResource {
  receptionInfo(reception: number): Promise<Record<string, unknown>> {
    return this.call('getReceptionInfo', { reception }, HttpMethod.POST);
  }

  securities(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getAllSecurities', params, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
