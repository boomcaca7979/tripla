"use client";

/**
 * Session state for the whole site — one hook, one auth source.
 *
 * Every signed-in surface (Header account chip, /trips sidebar, /trips Account
 * view) must read the **same** WorkBuddy Cloud session through `getCloud()`;
 * there is no second, page-local "fake" session anywhere.
 *
 * `ready` separates "still resolving" from "signed out" so a signed-in visitor
 * never sees a Sign in link flash on first paint. When the cloud client has no
 * public config (build-time `NEXT_PUBLIC_*` are inlined, so this is effectively
 * a build-time constant) the hook resolves immediately as signed out instead of
 * throwing, so an unconfigured environment degrades instead of crashing.
 */

import { useCallback, useEffect, useState } from "react";
import { CLOUD_CONFIGURED, getCloud } from "@/lib/cloud";

/** Minimal shape we rely on; the SDK session itself is larger than we need. */
function emailOf(session: unknown): string | null {
  const user = (session as { user?: { email?: string } | null } | null)?.user ?? null;
  return user?.email ?? null;
}

export function useSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!CLOUD_CONFIGURED);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLOUD_CONFIGURED) return;
    let alive = true;
    const apply = (session: unknown) => {
      if (!alive) return;
      setEmail(emailOf(session));
      setReady(true);
    };
    let cloud: ReturnType<typeof getCloud>;
    try {
      cloud = getCloud();
    } catch {
      // Unreachable while CLOUD_CONFIGURED is true; resolve as signed out
      // (deferred, so the effect body stays free of synchronous setState).
      queueMicrotask(() => {
        if (alive) setReady(true);
      });
      return () => {
        alive = false;
      };
    }
    cloud.auth
      .getSession()
      .then(({ data }) => apply(data))
      .catch(() => apply(null));
    const unsubscribe = cloud.auth.onAuthStateChange((_event, session) => apply(session));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      await getCloud().auth.signOut();
    } catch {
      // signOut clears local state unconditionally; treat failure as signed out.
    } finally {
      setBusy(false);
    }
  }, []);

  return { email, ready, busy, signOut };
}
