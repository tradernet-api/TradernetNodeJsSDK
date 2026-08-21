/**
 * Injectable clock for SID TTL and re-auth windows.
 */
export interface Clock {
  /** Current Unix timestamp in seconds. */
  now(): number;
}

export class SystemClock implements Clock {
  now(): number {
    return Math.floor(Date.now() / 1000);
  }
}

export class FixedClock implements Clock {
  constructor(private timestamp: number) {}

  now(): number {
    return this.timestamp;
  }

  set(timestamp: number): void {
    this.timestamp = timestamp;
  }
}
