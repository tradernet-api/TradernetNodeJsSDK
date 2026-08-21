import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class SecuritySessionApi extends BaseResource {
  list(): Promise<Record<string, unknown>> {
    return this.call('getSecuritySessions', {}, HttpMethod.POST);
  }

  open(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call('openSecuritySession', params, HttpMethod.POST);
  }

  requestCode(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getSecuritySessionCode', params, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
