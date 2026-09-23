/**
 * Supabase — server client (Server Components, Server Actions, Route Handlers).
 *
 * Session lives in HTTP cookies (managed by `@supabase/ssr`), so the server can
 * read the signed-in user directly. `localStorage` is never the identity source.
 *
 * `cookies()` is async in Next 16 — always `await` it.
 *
 * `setAll` throws when called from a Server Component (cookies are read-only
 * during render). That is expected and intentionally swallowed: the proxy
 * (`src/proxy.ts`) performs the actual refresh on every request, so the token
 * still rotates. Removing the try/catch would crash every Server Component that
 * happens to trigger a refresh.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./client";

export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: read-only cookie store.
          // Session refresh is handled by src/proxy.ts instead.
        }
      },
    },
  });
}
