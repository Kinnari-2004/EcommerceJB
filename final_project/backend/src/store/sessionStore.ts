export interface SessionInfo {
  userId: number;
  role: string;
  createdAt: Date;
  userAgent: string;
  ip: string;
}

export interface SessionEntry extends SessionInfo {
  jti: string;
}

class SessionStore {
  private sessions = new Map<string, SessionInfo>();
  private userIndex = new Map<number, Set<string>>();

  create(jti: string, info: SessionInfo): void {
    this.sessions.set(jti, info);
    let set = this.userIndex.get(info.userId);
    if (!set) { set = new Set(); this.userIndex.set(info.userId, set); }
    set.add(jti);
  }

  get(jti: string): SessionInfo | undefined {
    return this.sessions.get(jti);
  }

  delete(jti: string): void {
    const s = this.sessions.get(jti);
    if (!s) return;
    this.sessions.delete(jti);
    const set = this.userIndex.get(s.userId);
    if (set) { set.delete(jti); if (set.size === 0) this.userIndex.delete(s.userId); }
  }

  deleteAllForUser(userId: number): void {
    const set = this.userIndex.get(userId);
    if (!set) return;
    for (const jti of set) this.sessions.delete(jti);
    this.userIndex.delete(userId);
  }

  getForUser(userId: number): SessionEntry[] {
    const set = this.userIndex.get(userId);
    if (!set) return [];
    const result: SessionEntry[] = [];
    for (const jti of set) {
      const info = this.sessions.get(jti);
      if (info) result.push({ jti, ...info });
    }
    return result;
  }
}

export const sessionStore = new SessionStore();
