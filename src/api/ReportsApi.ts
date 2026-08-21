import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class ReportsApi extends BaseResource {
  broker(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call('getBrokerReport', params, HttpMethod.POST, true);
  }

  brokerUrl(query: Record<string, string | number | boolean>): string {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      qs.set(k, String(v));
    }
    return `${this.config.domain.replace(/\/+$/, '')}/reports/broker?${qs}`;
  }

  depositary(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.call('getDepositaryReport', params, HttpMethod.POST, true);
  }

  depositaryUrl(query: Record<string, string | number | boolean>): string {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      qs.set(k, String(v));
    }
    return `${this.config.domain.replace(/\/+$/, '')}/reports/depositary?${qs}`;
  }

  protected override requiresSid(): boolean {
    return true;
  }
}
