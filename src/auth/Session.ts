export class Session {
  constructor(
    readonly sid: string,
    readonly sidName: string,
    readonly userId: number | null,
    readonly login: string,
    readonly createdAt: Date,
    readonly expiresAt: Date,
    readonly domain: string,
  ) {}

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this.expiresAt.getTime();
  }

  toJSON(): Record<string, unknown> {
    return {
      sid: this.sid,
      sidName: this.sidName,
      userId: this.userId,
      login: this.login,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      domain: this.domain,
    };
  }

  static fromJSON(data: Record<string, unknown>): Session {
    return new Session(
      String(data.sid ?? ''),
      String(data.sidName ?? 'SID'),
      typeof data.userId === 'number' ? data.userId : null,
      String(data.login ?? ''),
      new Date(String(data.createdAt)),
      new Date(String(data.expiresAt)),
      String(data.domain ?? ''),
    );
  }
}
