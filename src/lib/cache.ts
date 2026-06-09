// ─── Cache entry wrapper ────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Unix timestamp in milliseconds
}

// ─── TravelCache ────────────────────────────────────────────────────────────

/**
 * Two-tier cache backed by an in-memory `Map` and `localStorage`.
 *
 * Reads check memory first (fast), then fall back to `localStorage` and
 * rehydrate the memory tier on a hit. All `localStorage` keys are prefixed
 * with `travel_cache_` for namespace isolation.
 */
export class TravelCache {
  private mem = new Map<string, CacheEntry<unknown>>();
  private readonly PREFIX = "travel_cache_";

  constructor() {
    if (typeof window === "undefined") return;

    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(this.PREFIX)) continue;

      try {
        const raw = localStorage.getItem(key);
        if (raw === null) continue;

        const entry = JSON.parse(raw) as CacheEntry<unknown>;
        if (Date.now() > entry.expiresAt) {
          localStorage.removeItem(key);
        }
      } catch {
        // Malformed entry — remove and move on.
        localStorage.removeItem(key);
      }
    }
  }

  // ── Read ────────────────────────────────────────────────────────────────

  get<T>(key: string): T | null {
    // 1. Check in-memory cache first.
    const memEntry = this.mem.get(key) as CacheEntry<T> | undefined;
    if (memEntry !== undefined) {
      if (Date.now() <= memEntry.expiresAt) {
        return memEntry.data;
      }
      // Expired in memory — remove stale entry.
      this.mem.delete(key);
    }

    if (typeof window === "undefined") return null;

    // 2. Fall back to localStorage.
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (raw === null) return null;

      const entry = JSON.parse(raw) as CacheEntry<T>;

      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }

      // Rehydrate memory tier.
      this.mem.set(key, entry as CacheEntry<unknown>);
      return entry.data;
    } catch {
      localStorage.removeItem(this.PREFIX + key);
      return null;
    }
  }

  // ── Write ───────────────────────────────────────────────────────────────

  set<T>(key: string, data: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    const entry: CacheEntry<T> = { data, expiresAt };

    // Always write to the fast tier.
    this.mem.set(key, entry as CacheEntry<unknown>);

    if (typeof window === "undefined") return;

    // Persist to localStorage; recover gracefully from quota errors.
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(entry));
    } catch {
      // Likely QuotaExceededError — cache will still be usable in-memory
      // for the lifetime of the page.
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  delete(key: string): void {
    this.mem.delete(key);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.PREFIX + key);
      } catch {
        // Best-effort only.
      }
    }
  }

  // ── Clear all ───────────────────────────────────────────────────────────

  clear(): void {
    this.mem.clear();

    if (typeof window !== "undefined") {
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith(this.PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Best-effort only.
      }
    }
  }
}

// ─── Default TTL constants ──────────────────────────────────────────────────

export const CACHE_TTL = {
  FLIGHT:     3_600_000,   // 1 hour
  WEATHER:   10_800_000,   // 3 hours
  CURRENCY:  21_600_000,   // 6 hours
  GEOCODING: 604_800_000,  // 7 days
} as const;

// ─── Singleton ──────────────────────────────────────────────────────────────

export const cache = new TravelCache();
