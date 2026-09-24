"use client";

/**
 * Session state for the whole site — one hook, one auth source.
 *
 * Every signed-in surface (Header account chip, /trips workspace) reads the
 * **same** Supabase session through the cookie-backed browser client. There is
 * no second, page-local "fake" session anywhere, and `localStorage` is never
 * treated as identity.
 *
 * `ready` separates "still resolving" from "signed out" so a signed-in visitor
 * never sees a Sign in link flash on first paint. When Supabase has no public
 * config (build-time `NEXT_PUBLIC_*` are inlined, so this is effectively a
 * build-time constant) the hook resolves immediately as signed out instead of
 * throwing, so an unconfigured environment degrades instead of crashing the
 * route through the error boundary.
 *
 * `userId` is returned alongside `email` because it — not the email — is the
 * workspace's data boundary: it is what RLS compares against `auth.uid()`, and
 * what the cloud data layer uses as its row-id namespace. Treat a change of
 * `userId` as a change of identity, not merely of the displayed label.
 *
 * Session resolution lives in this file and nowhere else: the hook for surfaces
 * that *render* identity, and `getSessionIdentity()` for write paths that only
 * need to know "who is writing" at the moment of an action.
 */

import { useCallback, useEffect, useState } from "react";

import { SUPABASE_CONFIGURED, createClient } from "@/lib/supabase/client";
import { currentPagePath, trackEvent } from "@/lib/analytics";

/** Minimal shape we rely on; the Supabase session itself is much larger. */
function identityOf(session: unknown): { userId: string | null; email: string | null } {
  const user = (session as { user?: { id?: string; email?: string } | null } | null)?.user ?? null;
  return { userId: user?.id ?? null, email: user?.email ?? null };
}

export function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!SUPABASE_CONFIGURED);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    let alive = true;
    const apply = (session: unknown) => {
      if (!alive) return;
      const identity = identityOf(session);
      setUserId(identity.userId);
      setEmail(identity.email);
      setReady(true);
    };

    let client: ReturnType<typeof createClient>;
    try {
      client = createClient();
    } catch {
      // Unreachable while SUPABASE_CONFIGURED is true; resolve as signed out
      // (deferred, so the effect body stays free of synchronous setState).
      queueMicrotask(() => {
        if (alive) setReady(true);
      });
      return () => {
        alive = false;
      };
    }

    client.auth
      .getSession()
      .then(({ data }) => apply(data.session))
      .catch(() => apply(null));

    const { data } = client.auth.onAuthStateChange((_event, session) => apply(session));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      trackEvent({ name: "signout", source_page: currentPagePath() });
      await createClient().auth.signOut();
    } catch {
      // signOut clears local session state unconditionally; a transport
      // failure still leaves the client signed out, so treat it as such.
    } finally {
      setBusy(false);
    }
  }, []);

  return { userId, email, ready, busy, signOut };
}

/**
 * Imperative, one-shot session read — for write paths that need the identity
 * only at the instant of an action (Save / Add to Trip on Destinations pages).
 *
 * Why not `useSession()` there: those triggers live inside list rows and can be
 * mounted dozens of times per page. Each `useSession()` instance opens its own
 * `onAuthStateChange` subscription and its own `getSession()` call, so N buttons
 * would mean N subscriptions for one fact. Reading once per click costs one call.
 *
 * `resolved: false` means "identity could not be determined" (the client could
 * not be constructed, or `getSession()` rejected). Callers MUST NOT treat that
 * as "signed out" — that would silently route a signed-in user's write into the
 * anonymous localStorage channel. Refuse the write instead.
 *
 * `SUPABASE_CONFIGURED === false` is a build-time constant and is genuinely
 * "no auth in this deployment": that resolves as signed out, not as unresolved.
 */
export async function getSessionIdentity(): Promise<{
  userId: string | null;
  email: string | null;
  resolved: boolean;
}> {
  if (!SUPABASE_CONFIGURED) return { userId: null, email: null, resolved: true };
  try {
    const { data } = await createClient().auth.getSession();
    return { ...identityOf(data.session), resolved: true };
  } catch {
    return { userId: null, email: null, resolved: false };
  }
}
