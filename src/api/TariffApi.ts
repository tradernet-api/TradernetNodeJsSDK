import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class TariffApi extends BaseResource {
  list(): Promise<Record<string, unknown>> {
    return this.call('GetListTariffs', {}, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
