import type { Session } from './Session.js';

export interface SessionLock {
  unlock(): void | Promise<void>;
}

export interface SessionStorage {
  delete(key: string): Promise<void>;
  load(key: string): Promise<Session | null>;
  loadMeta(key: string): Promise<Record<string, unknown> | null>;
  lock(key: string): Promise<SessionLock>;
  save(key: string, session: Session): Promise<void>;
  saveMeta(key: string, meta: Record<string, unknown>): Promise<void>;
}
