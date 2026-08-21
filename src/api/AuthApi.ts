import type { Session } from '../auth/Session.js';
import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class AuthApi extends BaseResource {
  byLogin(
    login: string,
    password: string,
    rememberMe = 1,
  ): Promise<Record<string, unknown>> {
    return this.sessions.loginWithPassword(login, password, rememberMe);
  }

  async bySms(
    authCodeId: string,
    sms: string,
    login: string | null = null,
  ): Promise<Record<string, unknown>> {
    const response = await this.call(
      'authBySms',
      { authCodeId, sms },
      HttpMethod.POST,
      false,
    );

    const label = login ?? this.sessions.configuredLogin() ?? authCodeId;
    this.sessions.adoptFromResponse(response, label);
    return response;
  }

  ensureSession(): Promise<Session | null> {
    return this.sessions.ensureSession(true);
  }

  getSms(phone: string): Promise<Record<string, unknown>> {
    return this.call('getAuthSms', { phone }, HttpMethod.POST, false);
  }

  info(): Promise<Record<string, unknown>> {
    return this.call('getAuthInfo', {}, HttpMethod.POST, true);
  }

  logoutLocal(): Promise<void> {
    return this.sessions.invalidate();
  }

  sidInfo(): Promise<Record<string, unknown>> {
    return this.call('getSidInfo', {}, HttpMethod.POST, true);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
