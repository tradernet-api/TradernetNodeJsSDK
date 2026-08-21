import type { Session } from '../Session.js';
import type { SessionLock, SessionStorage } from '../SessionStorage.js';

export class InMemorySessionStorage implements SessionStorage {
  private readonly files = new Map<
    string,
    { session?: Session; meta?: Record<string, unknown> }
  >();
  private readonly locks = new Map<string, number>();

  async delete(key: string): Promise<void> {
    const existing = this.files.get(key) ?? {};
    delete existing.session;
    if (existing.meta === undefined) {
      this.files.delete(key);
    } else {
      this.files.set(key, existing);
    }
  }

  async load(key: string): Promise<Session | null> {
    return this.files.get(key)?.session ?? null;
  }

  async loadMeta(key: string): Promise<Record<string, unknown> | null> {
    return this.files.get(key)?.meta ?? null;
  }

  async lock(key: string): Promise<SessionLock> {
    const depth = (this.locks.get(key) ?? 0) + 1;
    this.locks.set(key, depth);
    return {
      unlock: () => {
        const current = (this.locks.get(key) ?? 1) - 1;
        if (current <= 0) this.locks.delete(key);
        else this.locks.set(key, current);
      },
    };
  }

  async save(key: string, session: Session): Promise<void> {
    const existing = this.files.get(key) ?? {};
    existing.session = session;
    this.files.set(key, existing);
  }

  async saveMeta(key: string, meta: Record<string, unknown>): Promise<void> {
    const existing = this.files.get(key) ?? {};
    existing.meta = meta;
    this.files.set(key, existing);
  }
}
