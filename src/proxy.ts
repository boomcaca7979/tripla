/**
 * Proxy (Next 16's renamed Middleware) — Supabase session refresh.
 *
 * Scope discipline: this file does session maintenance ONLY.
 *
 *  · The apex → www 301 lives in `next.config.ts` (`redirects()` with a
 *    `has: [{ type: "host" }]` match) and is deliberately NOT duplicated here —
 *    two mechanisms for one redirect is how loops get introduced.
 *  · No route protection / no auth gates live here. `auth.uid()` + RLS on the
 *    database is the authorization boundary; this is only an optimistic,
 *    best-effort token refresh so cookies stay fresh for Server Components.
 *
 * Why it is needed: Server Components can read cookies but cannot write them.
 * When the access token expires mid-render, only a proxy can persist the
 * rotated token. `getUser()` is the call that triggers the rotation.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/client";

export async function proxy(request: NextRequest) {
  // Unconfigured environment: pass through untouched.
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Mirror onto the request so the current render sees fresh values...
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // ...then rebuild the response and write them to the browser.
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Must be getUser() (validates against Auth), not getSession() (reads the
  // cookie without verifying it).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image optimisation — refreshing the
     * session on those is pure overhead. `_next/static` and `_next/image` are
     * already covered by the extension list, but are kept explicit for clarity.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|txt|xml|json|woff|woff2|ttf|otf)$).*)",
  ],
};
