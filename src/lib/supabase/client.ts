/**
 * Supabase — browser client (Client Components).
 *
 * One project: UTRIPLA's own (ref `cfqsaboczludlxukyfyg`). Never SeeO's.
 *
 * Both values are `NEXT_PUBLIC_*` because the browser needs them, and both are
 * inlined at BUILD time — a missing var in the deployed environment is baked in
 * as `undefined`, so `SUPABASE_CONFIGURED` is effectively a build-time constant.
 *
 * SECURITY: the publishable key is NOT an authorization boundary. It only
 * identifies the project. Every row is protected by RLS on the database, keyed
 * on `auth.uid()`. The secret / service_role key must NEVER appear here, in any
 * other client file, in Git, or in logs.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Build-time constant. Read-only surfaces MUST check this before touching the
 * client so an unconfigured environment degrades to "signed out" instead of
 * throwing synchronously inside render/effect — the latter is caught by the
 * route error boundary and white-screens the whole page.
 */
export const SUPABASE_CONFIGURED = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY,
);

let cached: SupabaseClient | null = null;

/**
 * Lazily-created singleton browser client; throws only when unconfigured.
 *
 * The return type is annotated explicitly: `ReturnType<typeof createBrowserClient>`
 * collapses to `any` through the generic overload, which silently un-types every
 * call site (`getSession().then(({ data }) => …)` stops being checked).
 */
export function createClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return cached;
}
