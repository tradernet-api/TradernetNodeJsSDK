import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { ConfigurationError } from '../../errors/ConfigurationError.js';
import { Session } from '../Session.js';
import type { SessionLock, SessionStorage } from '../SessionStorage.js';

type FilePayload = {
  session?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

/**
 * File-backed session storage with atomic rename and mode 0o600.
 */
export class FileSessionStorage implements SessionStorage {
  private readonly heldLocks = new Map<string, number>();

  constructor(private readonly directory: string) {
    if (!existsSync(this.directory)) {
      mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    }
  }

  async delete(key: string): Promise<void> {
    await this.withLock(key, async () => {
      const existing = this.readFile(key);
      delete existing.session;
      if (Object.keys(existing).length === 0) {
        const path = this.sessionPath(key);
        if (existsSync(path)) unlinkSync(path);
        return;
      }
      this.writeFile(key, existing);
    });
  }

  async load(key: string): Promise<Session | null> {
    this.assertSafeKey(key);
    const path = this.sessionPath(key);
    if (!existsSync(path)) return null;
    try {
      const raw = readFileSync(path, 'utf8');
      if (!raw) return null;
      const data = JSON.parse(raw) as FilePayload;
      if (!data.session || typeof data.session !== 'object') return null;
      return Session.fromJSON(data.session);
    } catch {
      return null;
    }
  }

  async loadMeta(key: string): Promise<Record<string, unknown> | null> {
    this.assertSafeKey(key);
    const data = this.readFile(key);
    return data.meta ?? null;
  }

  async lock(key: string): Promise<SessionLock> {
    this.assertSafeKey(key);
    const depth = (this.heldLocks.get(key) ?? 0) + 1;
    this.heldLocks.set(key, depth);
    return {
      unlock: () => {
        const current = (this.heldLocks.get(key) ?? 1) - 1;
        if (current <= 0) this.heldLocks.delete(key);
        else this.heldLocks.set(key, current);
      },
    };
  }

  async save(key: string, session: Session): Promise<void> {
    await this.withLock(key, async () => {
      const existing = this.readFile(key);
      existing.session = session.toJSON();
      this.writeFile(key, existing);
    });
  }

  async saveMeta(key: string, meta: Record<string, unknown>): Promise<void> {
    await this.withLock(key, async () => {
      const existing = this.readFile(key);
      existing.meta = meta;
      this.writeFile(key, existing);
    });
  }

  private assertSafeKey(key: string): void {
    if (!/^[a-f0-9]{64}$/.test(key)) {
      throw new ConfigurationError('Invalid session storage key');
    }
  }

  private sessionPath(key: string): string {
    const hash = createHash('sha256').update(key).digest('hex').slice(0, 16);
    return join(this.directory, `${hash}.json`);
  }

  private readFile(key: string): FilePayload {
    this.assertSafeKey(key);
    const path = this.sessionPath(key);
    if (!existsSync(path)) return {};
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as FilePayload;
    } catch {
      return {};
    }
  }

  private writeFile(key: string, data: FilePayload): void {
    const path = this.sessionPath(key);
    const tmp = `${path}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(data), { mode: 0o600 });
    chmodSync(tmp, 0o600);
    renameSync(tmp, path);
    chmodSync(path, 0o600);
  }

  private async withLock(key: string, fn: () => Promise<void>): Promise<void> {
    const lock = await this.lock(key);
    try {
      await fn();
    } finally {
      await lock.unlock();
    }
  }
}
