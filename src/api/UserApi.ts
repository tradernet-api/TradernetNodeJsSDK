import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class UserApi extends BaseResource {
  anketaInfo(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getAnketa', params, HttpMethod.POST, true);
  }

  info(): Promise<Record<string, unknown>> {
    return this.call('getUserInfo', {}, HttpMethod.POST, true);
  }

  opq(): Promise<Record<string, unknown>> {
    return this.call('getOPQ', {}, HttpMethod.POST, true);
  }

  protected override requiresSid(): boolean {
    return true;
  }
}
