import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class CpsApi extends BaseResource {
  files(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.call('getCpsFiles', params, HttpMethod.POST, true);
  }

  history(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getClientCpsHistory', params, HttpMethod.POST, true);
  }

  submit(
    typeDocId: number,
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call(
      'submitCps',
      { type_doc_id: typeDocId, ...params },
      HttpMethod.POST,
      true,
    );
  }

  protected override requiresSid(): boolean {
    return true;
  }
}
